-- Source system: App
-- Sales agents & admins (simple auth, no hashing per prototype scope)
CREATE TABLE IF NOT EXISTS users (
    user_id     TEXT PRIMARY KEY,                     -- e.g. USR001
    username    TEXT UNIQUE NOT NULL,
    password    TEXT NOT NULL,                         -- plain text (prototype only)
    full_name   TEXT NOT NULL,
    role        TEXT NOT NULL,                         -- agent / admin
    email       TEXT,
    mobile      TEXT,
    branch      TEXT,
    designation TEXT,
    avatar_seed TEXT,                                  -- for generated avatar
    created_at  TEXT
);
