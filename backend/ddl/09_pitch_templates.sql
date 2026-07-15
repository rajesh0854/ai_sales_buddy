-- Source system: App
-- Customizable pitch-script templates (rules, techniques, tone)
CREATE TABLE IF NOT EXISTS pitch_templates (
    template_id  TEXT PRIMARY KEY,                    -- e.g. TPL001
    name         TEXT NOT NULL,
    description  TEXT,
    channel      TEXT,                                -- Telecalling / Face-to-Face / Both
    tone         TEXT,                                -- Warm & Consultative / Confident & Direct / ...
    structure    TEXT,                                -- JSON list of section names (opening, need, pitch, objection, close)
    rules        TEXT,                                -- JSON list of rule strings
    techniques   TEXT,                                -- JSON list of pitch techniques/guidelines
    is_default   INTEGER DEFAULT 0,
    created_by   TEXT,
    created_at   TEXT
);
