-- Source system: App
-- Feedback + rating on generated pitch scripts, and AI-derived improvement instructions
CREATE TABLE IF NOT EXISTS feedback (
    feedback_id             TEXT PRIMARY KEY,         -- e.g. FBK00001
    script_id               TEXT,
    agent_id                TEXT,
    rating                  INTEGER,                  -- 1-5
    outcome                 TEXT,                     -- Converted / Interested / Callback / Rejected / No Answer
    comments                TEXT,
    improvement_instruction TEXT,                     -- AI-synthesized guidance derived from this feedback
    created_at              TEXT,
    FOREIGN KEY (script_id) REFERENCES pitch_scripts(script_id)
);
