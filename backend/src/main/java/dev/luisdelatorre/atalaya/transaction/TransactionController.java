package dev.luisdelatorre.atalaya.transaction;

import dev.luisdelatorre.atalaya.category.CategoryRepository;
import dev.luisdelatorre.atalaya.transaction.TransactionDtos.CreateRequest;
import dev.luisdelatorre.atalaya.transaction.TransactionDtos.Response;
import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.time.YearMonth;
import java.util.List;

@RestController
@RequestMapping("/api/transactions")
public class TransactionController {

    private final TransactionRepository transactions;
    private final CategoryRepository categories;

    public TransactionController(TransactionRepository transactions, CategoryRepository categories) {
        this.transactions = transactions;
        this.categories = categories;
    }

    @GetMapping
    public List<Response> list(
            @RequestParam(required = false)
            @DateTimeFormat(pattern = "yyyy-MM") YearMonth month
    ) {
        var items = month == null
                ? transactions.findAllByOrderByOccurredOnDescIdDesc()
                : transactions.findByOccurredOnGreaterThanEqualAndOccurredOnLessThanOrderByOccurredOnDescIdDesc(
                month.atDay(1), month.plusMonths(1).atDay(1));
        return items.stream().map(Response::from).toList();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Response create(@Valid @RequestBody CreateRequest request) {
        var category = categories.findById(request.categoryId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "category_not_found"));
        var saved = transactions.save(new Transaction(
                request.description(), request.amount(), request.occurredOn(), category));
        return Response.from(saved);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        if (!transactions.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "transaction_not_found");
        }
        transactions.deleteById(id);
    }
}
