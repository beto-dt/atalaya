package dev.luisdelatorre.atalaya.category;

import jakarta.persistence.*;

@Entity
@Table(name = "categories")
public class Category {

    public enum Kind { EXPENSE, INCOME }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 60)
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 10)
    private Kind kind;

    protected Category() {}

    public Long getId() { return id; }
    public String getName() { return name; }
    public Kind getKind() { return kind; }
}
