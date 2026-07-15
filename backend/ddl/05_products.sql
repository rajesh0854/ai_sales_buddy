-- Source system: Product Catalog
-- EXL Bank Limited product master with detailed descriptions
CREATE TABLE IF NOT EXISTS products (
    product_id         TEXT PRIMARY KEY,              -- e.g. PRD001
    product_code       TEXT,
    name               TEXT NOT NULL,
    category           TEXT NOT NULL,                 -- Home Loan / Personal Loan / Car Loan / Credit Card / Fixed Deposit / Savings / Insurance / Investment
    tagline            TEXT,
    description        TEXT,                          -- rich long description
    key_benefits       TEXT,                          -- JSON list
    features           TEXT,                          -- JSON list
    interest_rate_min  REAL,                          -- % p.a. (loans/FD)
    interest_rate_max  REAL,
    min_amount         REAL,
    max_amount         REAL,
    tenure_min_months  INTEGER,
    tenure_max_months  INTEGER,
    processing_fee     TEXT,                          -- e.g. "0.5% of loan amount (max Rs.10,000)"
    annual_fee         REAL,                          -- for cards
    target_segment     TEXT,                          -- JSON list of segments
    is_active          INTEGER DEFAULT 1
);
