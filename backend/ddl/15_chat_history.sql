-- Source system: App
-- Quick chatbot Q&A history (keyword Q&A + product comparison)
CREATE TABLE IF NOT EXISTS chat_history (
    chat_id      TEXT PRIMARY KEY,                    -- e.g. CHT00001
    customer_id  TEXT,                                -- optional (personalized to customer)
    agent_id     TEXT,
    mode         TEXT,                                -- qa / comparison
    question     TEXT NOT NULL,
    answer       TEXT,                                -- ready-to-speak answer
    products_compared TEXT,                           -- JSON list of product_ids (comparison mode)
    created_at   TEXT
);
