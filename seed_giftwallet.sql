-- seed_giftwallet.sql

-- BORRAR TABLAS EXISTENTES
DROP TABLE IF EXISTS card_product_store CASCADE;
DROP TABLE IF EXISTS card_products CASCADE;
DROP TABLE IF EXISTS stores CASCADE;
DROP TABLE IF EXISTS issuers CASCADE;

-- CREAR TABLAS
CREATE TABLE issuers (
    id TEXT PRIMARY KEY,
    name TEXT UNIQUE NOT NULL
);

CREATE TABLE stores (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    category TEXT,
    website_url TEXT,
    UNIQUE(name)
);

CREATE TABLE card_products (
    id SERIAL PRIMARY KEY,
    issuer_id TEXT NOT NULL REFERENCES issuers(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    UNIQUE (issuer_id, name)
);

CREATE TABLE card_product_store (
    id SERIAL PRIMARY KEY,
    card_product_id INT NOT NULL REFERENCES card_products(id) ON DELETE CASCADE,
    store_id INT NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
    availability TEXT DEFAULT 'both' NOT NULL
);

-- INSERTAR DATOS

-- ISSUERS
INSERT INTO issuers (id, name) VALUES
('visa', 'Visa'),
('mastercard', 'Mastercard'),
('amex', 'American Express'),
('paypal', 'PayPal'),
('amazon', 'Amazon'),
('apple', 'Apple'),
('google', 'Google')
ON CONFLICT (id) DO NOTHING;

-- STORES
INSERT INTO stores (name, category, website_url) VALUES
('Walmart', 'Retail', 'https://www.walmart.com'),
('Target', 'Retail', 'https://www.target.com'),
('Amazon Store', 'E-commerce', 'https://www.amazon.com'),
('Apple Store', 'Electronics', 'https://www.apple.com'),
('Google Store', 'Electronics', 'https://store.google.com')
ON CONFLICT (name) DO NOTHING;

-- CARD PRODUCTS
INSERT INTO card_products (issuer_id, name) VALUES
('visa', 'Visa Gift Card'),
('mastercard', 'Mastercard Gift Card'),
('amex', 'Amex Gift Card'),
('paypal', 'PayPal Prepaid'),
('amazon', 'Amazon Gift Card'),
('apple', 'Apple Gift Card'),
('google', 'Google Play Gift Card')
ON CONFLICT (issuer_id, name) DO NOTHING;

-- CARD PRODUCT STORE
-- Nota: necesitamos IDs reales de stores y card_products
-- Vamos a asumir IDs secuenciales para simplificar
-- Stores: Walmart=1, Target=2, Amazon=3, Apple=4, Google=5
-- Card Products: orden de inserción 1..7
INSERT INTO card_product_store (card_product_id, store_id, availability) VALUES
(1, 1, 'both'),   -- Visa Gift Card en Walmart
(2, 2, 'both'),   -- Mastercard Gift Card en Target
(3, 1, 'both'),   -- Amex Gift Card en Walmart
(4, 3, 'both'),   -- PayPal Prepaid en Amazon Store
(5, 3, 'both'),   -- Amazon Gift Card en Amazon Store
(6, 4, 'both'),   -- Apple Gift Card en Apple Store
(7, 5, 'both')    -- Google Play Gift Card en Google Store
ON CONFLICT DO NOTHING;
