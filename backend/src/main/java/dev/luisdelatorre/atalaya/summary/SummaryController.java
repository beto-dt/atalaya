package dev.luisdelatorre.atalaya.summary;

import dev.luisdelatorre.atalaya.budget.BudgetRepository;
import dev.luisdelatorre.atalaya.category.Category;
import dev.luisdelatorre.atalaya.transaction.TransactionRepository;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.YearMonth;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/summary")
public class SummaryController {

    public record CategorySummary(
            Long categoryId,
            String name,
            Category.Kind kind,
            BigDecimal total,
            BigDecimal budget
    ) {}

    public record SummaryResponse(
            YearMonth month,
            BigDecimal income,
            BigDecimal expense,
            BigDecimal balance,
            List<CategorySummary> byCategory
    ) {}

    private final TransactionRepository transactions;
    private final BudgetRepository budgets;

    public SummaryController(TransactionRepository transactions, BudgetRepository budgets) {
        this.transactions = transactions;
        this.budgets = budgets;
    }

    @GetMapping
    public SummaryResponse summary(
            @RequestParam(required = false)
            @DateTimeFormat(pattern = "yyyy-MM") YearMonth month
    ) {
        var target = month != null ? month : YearMonth.now();
        var totals = transactions.totalsByCategory(
                target.atDay(1),
                target.plusMonths(1).atDay(1)
        );

        var income = sumByKind(totals, Category.Kind.INCOME);
        var expense = sumByKind(totals, Category.Kind.EXPENSE);

        Map<Long, BigDecimal> limits = budgets.findAll().stream()
                .collect(Collectors.toMap(
                        b -> b.getCategory().getId(),
                        b -> b.getMonthlyLimit()
                ));

        var byCategory = totals.stream()
                .map(t -> new CategorySummary(
                        t.getCategoryId(), t.getName(), t.getKind(), t.getTotal(),
                        limits.get(t.getCategoryId())))
                .toList();

        return new SummaryResponse(target, income, expense, income.subtract(expense), byCategory);
    }

    private static BigDecimal sumByKind(List<TransactionRepository.CategoryTotal> totals, Category.Kind kind) {
        return totals.stream()
                .filter(t -> t.getKind() == kind)
                .map(TransactionRepository.CategoryTotal::getTotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }
}
