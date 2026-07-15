-- Source system: App / Compliance
-- Mis-selling & compliance guardrail results for a generated pitch or message
CREATE TABLE IF NOT EXISTS compliance_checks (
    check_id            TEXT PRIMARY KEY,             -- e.g. CMP00001
    subject_type        TEXT,                         -- pitch_script / message
    subject_id          TEXT,                         -- script_id or message_id
    status              TEXT,                         -- Pass / Warning / Fail
    risk_score          INTEGER,                      -- 0-100 (higher = riskier)
    flags               TEXT,                         -- JSON list of {severity, issue, excerpt, suggestion}
    missing_disclosures TEXT,                         -- JSON list
    checked_at          TEXT
);
