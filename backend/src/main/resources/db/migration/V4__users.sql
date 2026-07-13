CREATE TABLE users (
           id            BIGSERIAL PRIMARY KEY,
           email         VARCHAR(120) NOT NULL UNIQUE,
           password_hash VARCHAR(100) NOT NULL
);
