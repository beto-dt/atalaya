# Atalaya 🏰

Personal finance app — expenses, budgets and a financial health score,
watched from the tower. Built to be **used daily** and to showcase a
production-shaped **Java backend**: Spring Boot 4, PostgreSQL, Flyway and
Docker.

> ⚠️ Personal tool: the code is public, the data is not. The database lives
> only on my machine.

## One command

```bash
docker compose up
```

That's the whole backend: PostgreSQL 16 + the Spring Boot API (multi-stage
Docker build, JRE-only runtime image). Then:

```bash
cd web && npm install && npm run dev   # → http://localhost:5173
```

## What it does

- Register incomes and expenses with categories, browse any month
- Live monthly summary: balance, income vs expense — aggregations computed
  **in the database** (JPA projections + `GROUP BY`), never in memory
- **Budgets per category** with traffic-light progress bars (amber at 75%,
  red past the limit), edited inline
- **Financial health score (0-100)** with explainable components: savings
  rate (50 pts), budget discipline (30 pts) and fixed-expense load (20 pts) —
  an adaptation of the 50/30/20 rule

## Architecture

```
React 19 + Vite + Tailwind 4  ──HTTP──►  Spring Boot 4 (Java 21)
                                              │  JPA / Hibernate
                                              ▼
                                    PostgreSQL 16 (Docker)
                                    Flyway-versioned schema (V1..V3)
```

### Decisions worth reading

- **Amounts are always positive** — income/expense derives from the
  category's kind. No sign bugs, and a `CHECK` constraint backs it up.
- **`BigDecimal` + `NUMERIC(12,2)`** — floating point has no place in money.
- **Half-open date ranges** (`[first day, first of next month)`) for month
  filters — the boundary-safe pattern.
- **`ddl-auto: validate` + Flyway** — the schema is code-reviewed SQL, not
  whatever the ORM feels like generating.
- **`open-in-view: false` + `@EntityGraph`** — lazy loading done right; the
  N+1 and LazyInitializationException classics, handled explicitly.
- **Fixed vs variable is data, not code** — `is_fixed` lives on the category
  row, so the score adapts when life changes.

## Stack

Java 21 · Spring Boot 4 · Spring Data JPA · Flyway · PostgreSQL 16 · Docker ·
React 19 · TypeScript · Vite · Tailwind 4

## Roadmap

- [ ] Auth (JWT) + cloud deploy
- [ ] Monthly trends (multi-month charts)
- [ ] CSV import from bank statements

---

Built by [Luis Alberto De La Torre](https://luisdelatorre.dev) — Senior
Full-Stack & Mobile developer · [more projects](https://luisdelatorre.dev/proyectos)
