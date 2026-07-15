-- Source system: CRM
-- Master customer profile (demographic + KYC + risk)
CREATE TABLE IF NOT EXISTS customers (
    customer_id        TEXT PRIMARY KEY,              -- e.g. EXLC0001
    first_name         TEXT NOT NULL,
    last_name          TEXT NOT NULL,
    full_name          TEXT NOT NULL,
    date_of_birth      TEXT NOT NULL,                 -- YYYY-MM-DD
    age                INTEGER NOT NULL,
    gender             TEXT NOT NULL,                 -- Male / Female
    pan                TEXT,                          -- masked, e.g. ABCDE1234F
    aadhaar_masked     TEXT,                          -- XXXX XXXX 1234
    email              TEXT,
    mobile             TEXT,
    address_line       TEXT,
    city               TEXT,
    state              TEXT,
    pincode            TEXT,
    occupation         TEXT,                          -- Salaried / Self-Employed / Business / Retired
    employer           TEXT,
    industry           TEXT,
    annual_income      REAL,                          -- INR
    income_band        TEXT,                          -- <5L, 5-10L, 10-25L, 25-50L, 50L+
    marital_status     TEXT,
    dependents         INTEGER,
    education          TEXT,
    residence_type     TEXT,                          -- Owned / Rented
    segment            TEXT NOT NULL,                 -- Mass / Affluent / HNI
    cibil_score        INTEGER,                       -- 300-900
    relationship_since TEXT,                          -- YYYY-MM-DD
    kyc_status         TEXT,                          -- Verified / Pending
    risk_category      TEXT,                          -- Low / Medium / High
    preferred_language TEXT,                          -- English / Hindi / Tamil / Telugu / ...
    home_branch        TEXT,
    created_at         TEXT
);
