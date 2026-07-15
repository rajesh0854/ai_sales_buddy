-- Source system: App
-- Free-text notes captured by the agent, enriched with AI intelligence
CREATE TABLE IF NOT EXISTS notes (
    note_id      TEXT PRIMARY KEY,                    -- e.g. NOTE0001
    customer_id  TEXT NOT NULL,
    agent_id     TEXT,
    content      TEXT NOT NULL,                       -- raw note text
    ai_summary   TEXT,                                -- AI condensed summary
    sentiment    TEXT,                                -- Positive / Neutral / Negative
    key_points   TEXT,                                -- JSON list of extracted intelligence
    created_at   TEXT,
    FOREIGN KEY (customer_id) REFERENCES customers(customer_id)
);
