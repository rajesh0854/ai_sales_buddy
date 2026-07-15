-- Source system: Core Banking + external bureau pull
-- Products the customer already holds (with EXL Bank OR competitor banks)
CREATE TABLE IF NOT EXISTS existing_products (
    holding_id         TEXT PRIMARY KEY,              -- e.g. HLD00001
    customer_id        TEXT NOT NULL,
    product_type       TEXT NOT NULL,                 -- Home Loan / Personal Loan / Credit Card / FD / Insurance / ...
    product_name       TEXT,
    provider           TEXT,                          -- EXL Bank Limited / HDFC / ICICI / SBI / Axis ...
    is_own_bank        INTEGER,                       -- 1 if EXL Bank, else 0 (competitor)
    sanctioned_amount  REAL,
    outstanding_amount REAL,
    emi                REAL,
    interest_rate      REAL,
    start_date         TEXT,
    end_date           TEXT,
    status             TEXT,                          -- Active / Closed
    FOREIGN KEY (customer_id) REFERENCES customers(customer_id)
);
