-- Source system: Core Banking
-- Deposit accounts held with EXL Bank Limited
CREATE TABLE IF NOT EXISTS accounts (
    account_id          TEXT PRIMARY KEY,             -- e.g. AC00001
    customer_id         TEXT NOT NULL,
    account_type        TEXT NOT NULL,                -- Savings / Salary / Current
    account_number      TEXT,
    ifsc                TEXT,
    branch              TEXT,
    balance             REAL,                         -- current balance INR
    avg_monthly_balance REAL,
    open_date           TEXT,
    status              TEXT,                         -- Active / Dormant
    FOREIGN KEY (customer_id) REFERENCES customers(customer_id)
);
