package dev.luisdelatorre.atalaya.summary;

import dev.luisdelatorre.atalaya.category.Category;
import dev.luisdelatorre.atalaya.transaction.TransactionRepository;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;
import java.math.BigDecimal;
import java.time.YearMonth;
import java.util.List;

@RestController
@RequestMapping("/api/summary")
public class SummaryController {

    public record CategorySummary(Long categoryId, String name, Category.Kind kind, BigDecimal total) {}

    public record SummaryResponse(
            YearMonth month,
            BigDecimal income,
            BigDecimal expense,
            BigDecimal balance,
            List<CategorySummary> byCategory
    ) {}

    private final TransactionRepository transactions;

    public SummaryController(TransactionRepository transactions) {
        this.transactions = transactions;
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

        var byCategory = totals.stream()
                .map(t -> new CategorySummary(t.getCategoryId(), t.getName(), t.getKind(), t.getTotal()))
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
