-- Source system: ML Recommendation Store
-- Model-generated next-best-product recommendations per customer
CREATE TABLE IF NOT EXISTS recommendations (
    recommendation_id TEXT PRIMARY KEY,               -- e.g. REC00001
    customer_id       TEXT NOT NULL,
    product_id        TEXT NOT NULL,
    propensity_score  REAL,                           -- 0-1 likelihood to convert
    rank              INTEGER,                        -- 1 = top recommendation for customer
    expected_value    REAL,                           -- expected revenue / value INR
    reason_codes      TEXT,                           -- JSON list of model reason codes (human readable)
    model_version     TEXT,                           -- e.g. NBO_MODEL_v3.2
    generated_at      TEXT,
    status            TEXT,                           -- New / Contacted / Converted / Rejected
    FOREIGN KEY (customer_id) REFERENCES customers(customer_id),
    FOREIGN KEY (product_id) REFERENCES products(product_id)
);
