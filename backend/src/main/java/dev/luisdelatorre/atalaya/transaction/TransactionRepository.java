package dev.luisdelatorre.atalaya.transaction;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface TransactionRepository extends JpaRepository<Transaction, Long> {

    @EntityGraph(attributePaths = "category")
    List<Transaction> findAllByOrderByOccurredOnDescIdDesc();
}
