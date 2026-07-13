package dev.luisdelatorre.atalaya.transaction;

import dev.luisdelatorre.atalaya.category.Category;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public interface TransactionRepository extends JpaRepository<Transaction, Long> {

    @EntityGraph(attributePaths = "category")
    List<Transaction> findAllByOrderByOccurredOnDescIdDesc();

    /** Projection: Spring maps each alias to these getters. */
    interface CategoryTotal {
        Long getCategoryId();
        String getName();
        Category.Kind getKind();
        BigDecimal getTotal();
    }

    @Query("""
            select c.id as categoryId, c.name as name, c.kind as kind, sum(t.amount) as total
            from Transaction t
            join t.category c
            where t.occurredOn >= :from and t.occurredOn < :to
            group by c.id, c.name, c.kind
            order by sum(t.amount) desc
            """)

    List<CategoryTotal> totalsByCategory(LocalDate from, LocalDate to);

    @EntityGraph(attributePaths = "category")
    List<Transaction> findByOccurredOnGreaterThanEqualAndOccurredOnLessThanOrderByOccurredOnDescIdDesc(
            LocalDate from, LocalDate to);

}
