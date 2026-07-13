package dev.luisdelatorre.atalaya.health;

import dev.luisdelatorre.atalaya.budget.BudgetRepository;
import dev.luisdelatorre.atalaya.category.Category;
import dev.luisdelatorre.atalaya.category.CategoryRepository;
import dev.luisdelatorre.atalaya.transaction.TransactionRepository;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.YearMonth;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/health")
public class HealthController {

    public record Components(int savings, int budgets, int fixedLoad) {}

    public record HealthResponse(
            YearMonth month,
            Integer score,          // null = sin ingresos, no calculable
            String level,
            double savingsRate,     // 0.18 = 18%
            double fixedRatio,      // fijos / ingresos
            int budgetsOk,
            int budgetsTotal,
            Components components
    ) {}

    private final TransactionRepository transactions;
    private final BudgetRepository budgets;
    private final CategoryRepository categories;

    public HealthController(TransactionRepository transactions, BudgetRepository budgets,
                            CategoryRepository categories) {
        this.transactions = transactions;
        this.budgets = budgets;
        this.categories = categories;
    }

    @GetMapping
    public HealthResponse health(
            @RequestParam(required = false)
            @DateTimeFormat(pattern = "yyyy-MM") YearMonth month
    ) {
        var target = month != null ? month : YearMonth.now();
        var totals = transactions.totalsByCategory(target.atDay(1), target.plusMonths(1).atDay(1));

        double income = 0, expense = 0, fixedExpense = 0;
        Map<Long, Boolean> fixedByCategory = categories.findAll().stream()
                .collect(Collectors.toMap(Category::getId, Category::isFixed));

        Map<Long, BigDecimal> spentByCategory = totals.stream()
                .filter(t -> t.getKind() == Category.Kind.EXPENSE)
                .collect(Collectors.toMap(
                        TransactionRepository.CategoryTotal::getCategoryId,
                        TransactionRepository.CategoryTotal::getTotal));

        for (var t : totals) {
            double value = t.getTotal().doubleValue();
            if (t.getKind() == Category.Kind.INCOME) {
                income += value;
            } else {
                expense += value;
                if (fixedByCategory.getOrDefault(t.getCategoryId(), false)) fixedExpense += value;
            }
        }

        var allBudgets = budgets.findAll();
        int budgetsTotal = allBudgets.size();
        int budgetsOk = (int) allBudgets.stream()
                .filter(b -> {
                    var spent = spentByCategory.getOrDefault(b.getCategory().getId(), BigDecimal.ZERO);
                    return spent.compareTo(b.getMonthlyLimit()) <= 0;
                })
                .count();

        if (income <= 0) {
            return new HealthResponse(target, null, "SIN_DATOS", 0, 0, budgetsOk, budgetsTotal,
                    new Components(0, 0, 0));
        }

        double savingsRate = (income - expense) / income;
        double fixedRatio = fixedExpense / income;

        int savingsPts = (int) Math.round(clamp(savingsRate / 0.20) * 50);
        int budgetPts = budgetsTotal == 0
                ? 15  // sin presupuestos definidos: puntaje neutral (define límites para ganar los 30)
                : (int) Math.round((budgetsOk / (double) budgetsTotal) * 30);
        int fixedPts = (int) Math.round(clamp((0.80 - fixedRatio) / 0.30) * 20);

        int score = savingsPts + budgetPts + fixedPts;
        String level = score >= 80 ? "SOLIDA" : score >= 60 ? "ESTABLE" : score >= 40 ? "ATENCION" : "EN_RIESGO";

        return new HealthResponse(target, score, level, savingsRate, fixedRatio,
                budgetsOk, budgetsTotal, new Components(savingsPts, budgetPts, fixedPts));
    }

    private static double clamp(double v) {
        return Math.max(0, Math.min(1, v));
    }
}
