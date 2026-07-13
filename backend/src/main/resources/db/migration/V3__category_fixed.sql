ALTER TABLE categories ADD COLUMN is_fixed BOOLEAN NOT NULL DEFAULT false;

UPDATE categories SET is_fixed = true WHERE name IN ('Hogar', 'Suscripciones');
