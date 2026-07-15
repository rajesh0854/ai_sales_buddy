-- Source system: Product Catalog / Compliance
-- Eligibility policy + full policy document per product
CREATE TABLE IF NOT EXISTS product_policies (
    policy_id           TEXT PRIMARY KEY,             -- e.g. POL001
    product_id          TEXT NOT NULL,
    min_age             INTEGER,
    max_age             INTEGER,
    min_annual_income   REAL,
    min_cibil           INTEGER,
    eligible_employment TEXT,                         -- JSON list: Salaried / Self-Employed / Business ...
    max_ltv             REAL,                         -- loan-to-value % (secured loans)
    max_foir            REAL,                         -- fixed obligation to income ratio %
    min_balance         REAL,                         -- for savings/deposit products
    required_documents  TEXT,                         -- JSON list
    other_conditions    TEXT,                         -- JSON list of rule strings
    mandatory_disclosures TEXT,                       -- JSON list (RBI-style disclosures)
    policy_document     TEXT,                         -- full rich-text policy document
    FOREIGN KEY (product_id) REFERENCES products(product_id)
);
