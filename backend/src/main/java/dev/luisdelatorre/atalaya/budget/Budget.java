package dev.luisdelatorre.atalaya.budget;

import dev.luisdelatorre.atalaya.category.Category;
import jakarta.persistence.*;
import java.math.BigDecimal;

@Entity
@Table(name = "budgets")
public class Budget {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "category_id", unique = true)
    private Category category;

    @Column(name = "monthly_limit", nullable = false, precision = 12, scale = 2)
    private BigDecimal monthlyLimit;

    protected Budget() {} // JPA

    public Budget(Category category, BigDecimal monthlyLimit) {
        this.category = category;
        this.monthlyLimit = monthlyLimit;
    }

    public Long getId() { return id; }
    public Category getCategory() { return category; }
    public BigDecimal getMonthlyLimit() { return monthlyLimit; }
    public void setMonthlyLimit(BigDecimal monthlyLimit) { this.monthlyLimit = monthlyLimit; }
}
