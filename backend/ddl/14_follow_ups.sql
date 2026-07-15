-- Source system: App
-- Follow-ups / callbacks / events derived from notes or created manually
CREATE TABLE IF NOT EXISTS follow_ups (
    followup_id  TEXT PRIMARY KEY,                    -- e.g. FUP0001
    customer_id  TEXT NOT NULL,
    agent_id     TEXT,
    note_id      TEXT,                                -- optional source note
    title        TEXT NOT NULL,
    description  TEXT,
    type         TEXT,                                -- Callback / Meeting / Task / Reminder
    due_date     TEXT,                                -- YYYY-MM-DD
    due_time     TEXT,                                -- HH:MM
    priority     TEXT,                                -- High / Medium / Low
    status       TEXT,                                -- Pending / Done / Missed
    created_at   TEXT,
    FOREIGN KEY (customer_id) REFERENCES customers(customer_id)
);
