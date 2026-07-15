-- Source system: App
-- Admin-triggered, AI-synthesized improvement guides distilled from many feedbacks
-- (suggestions that can be incorporated back into pitch templates)
CREATE TABLE IF NOT EXISTS improvement_guides (
    guide_id          TEXT PRIMARY KEY,               -- e.g. GDE001
    title             TEXT,
    based_on_count    INTEGER,                        -- number of feedbacks analysed
    avg_rating        REAL,
    suggestions       TEXT,                           -- JSON list of actionable suggestions
    summary           TEXT,
    generated_at      TEXT
);
