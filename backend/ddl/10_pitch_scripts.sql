-- Source system: App
-- Generated personalized pitch scripts
CREATE TABLE IF NOT EXISTS pitch_scripts (
    script_id     TEXT PRIMARY KEY,                   -- e.g. SCR00001
    customer_id   TEXT NOT NULL,
    product_id    TEXT NOT NULL,
    template_id   TEXT,
    agent_id      TEXT,
    language      TEXT DEFAULT 'English',
    title         TEXT,
    script_content TEXT,                              -- JSON: {opening, hook, need_discovery, product_pitch, value_prop, objection_preempt, closing, ...}
    talking_points TEXT,                              -- JSON list
    generated_at  TEXT,
    status        TEXT,                               -- Draft / Used / Archived
    FOREIGN KEY (customer_id) REFERENCES customers(customer_id),
    FOREIGN KEY (product_id) REFERENCES products(product_id)
);
