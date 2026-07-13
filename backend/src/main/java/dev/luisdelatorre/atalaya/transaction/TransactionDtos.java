package dev.luisdelatorre.atalaya.transaction;

import dev.luisdelatorre.atalaya.category.Category;
import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import java.time.LocalDate;

public class TransactionDtos {
    public record CreateRequest(
        @NotBlank @Size(max = 120) String description,
        @NotNull @Positive BigDecimal amount,
        @NotNull LocalDate occurredOn,
        @NotNull Long categoryId
    ){}

    public record Response(
        Long id,
        String description,
        BigDecimal amount,
        LocalDate occurredOn,
        Long categoryId,
        String categoryName,
        Category.Kind kind
    ){
        static Response from(Transaction t) {
            return new Response(
                    t.getId(), t.getDescription(), t.getAmount(), t.getOccurredOn(),
                    t.getCategory().getId(), t.getCategory().getName(), t.getCategory().getKind()
            );
        }
    }
}
