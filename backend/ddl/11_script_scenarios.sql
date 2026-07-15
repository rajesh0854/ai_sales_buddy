-- Source system: App
-- Pre-generated dynamic scenario branches for a pitch script
-- (loaded on the fly during a live call instead of regenerating the whole script)
CREATE TABLE IF NOT EXISTS script_scenarios (
    scenario_id   TEXT PRIMARY KEY,                   -- e.g. SCN00001
    script_id     TEXT NOT NULL,
    scenario_key  TEXT,                               -- already_has_product / price_objection / not_interested / needs_time / competitor_offer / trust_concern
    title         TEXT,                               -- display label
    trigger_hint  TEXT,                               -- when to use this branch
    content       TEXT,                               -- ready-to-speak rebuttal / redirect script
    sort_order    INTEGER,
    FOREIGN KEY (script_id) REFERENCES pitch_scripts(script_id)
);
