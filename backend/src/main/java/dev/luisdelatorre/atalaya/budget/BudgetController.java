package dev.luisdelatorre.atalaya.budget;

import dev.luisdelatorre.atalaya.category.CategoryRepository;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/budgets")
public class BudgetController {

    public record UpsertRequest(@NotNull @Positive BigDecimal monthlyLimit) {}
    public record Response(Long categoryId, String categoryName, BigDecimal monthlyLimit) {
        static Response from(Budget b) {
            return new Response(b.getCategory().getId(), b.getCategory().getName(), b.getMonthlyLimit());
        }
    }

    private final BudgetRepository budgets;
    private final CategoryRepository categories;

    public BudgetController(BudgetRepository budgets, CategoryRepository categories) {
        this.budgets = budgets;
        this.categories = categories;
    }

    @GetMapping
    public List<Response> list() {
        return budgets.findAll().stream().map(Response::from).toList();
    }

    @PutMapping("/{categoryId}")
    public Response upsert(@PathVariable Long categoryId, @Valid @RequestBody UpsertRequest request) {
        var budget = budgets.findByCategoryId(categoryId)
                .map(b -> { b.setMonthlyLimit(request.monthlyLimit()); return b; })
                .orElseGet(() -> {
                    var category = categories.findById(categoryId)
                            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "category_not_found"));
                    return new Budget(category, request.monthlyLimit());
                });
        return Response.from(budgets.save(budget));
    }

    @DeleteMapping("/{categoryId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long categoryId) {
        budgets.findByCategoryId(categoryId).ifPresent(budgets::delete);
    }
}
