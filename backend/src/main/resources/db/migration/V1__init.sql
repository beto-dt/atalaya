CREATE TABLE categories (
    id  BIGSERIAL PRIMARY KEY,
    name VARCHAR(60) NOT NULL UNIQUE,
    kind VARCHAR(10) NOT NULL  CHECK (kind IN ('EXPENSE', 'INCOME'))
);

CREATE TABLE transactions (
    id          BIGSERIAL PRIMARY KEY,
    description VARCHAR(120) NOT NULL,
    amount      NUMERIC(12, 2) NOT NULL CHECK (amount > 0),
    occurred_on DATE NOT NULL,
    category_id BIGINT NOT NULL REFERENCES categories (id),
    created_at  TIMESTAMP NOT NULL DEFAULT now()
);

CREATE  INDEX idx_transactions_occurred_on ON transactions (occurred_on);
CREATE INDEX idx_transactions_category ON transactions (category_id);

INSERT INTO categories (name, kind) VALUES
    ('Comida', 'EXPENSE'),
    ('Transporte', 'EXPENSE'),
    ('Hogar', 'EXPENSE'),
    ('Ocio', 'EXPENSE'),
    ('Salud', 'EXPENSE'),
    ('Suscripciones', 'EXPENSE'),
    ('Sueldo', 'INCOME'),
    ('Freelance', 'INCOME');
