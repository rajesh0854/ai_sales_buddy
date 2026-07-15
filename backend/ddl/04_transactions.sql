-- Source system: Transaction Warehouse
-- Categorized account transactions (~12 months per customer)
CREATE TABLE IF NOT EXISTS transactions (
    txn_id        TEXT PRIMARY KEY,                   -- e.g. TXN0000001
    customer_id   TEXT NOT NULL,
    account_id    TEXT,
    txn_date      TEXT NOT NULL,                      -- YYYY-MM-DD
    value_date    TEXT,
    description   TEXT,
    category      TEXT,                               -- Salary / EMI / Shopping / Groceries / Utilities / Investment / Travel / Dining / Cash / Transfer / Insurance
    txn_type      TEXT NOT NULL,                      -- credit / debit
    amount        REAL NOT NULL,
    balance_after REAL,
    channel       TEXT,                               -- UPI / NEFT / Card / ATM / Cheque / AutoDebit
    merchant      TEXT,
    FOREIGN KEY (customer_id) REFERENCES customers(customer_id),
    FOREIGN KEY (account_id) REFERENCES accounts(account_id)
);
