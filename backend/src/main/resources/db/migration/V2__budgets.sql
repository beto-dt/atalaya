CREATE TABLE budgets (
         id            BIGSERIAL PRIMARY KEY,
         category_id   BIGINT NOT NULL UNIQUE REFERENCES categories (id),
         monthly_limit NUMERIC(12, 2) NOT NULL CHECK (monthly_limit > 0)
);
