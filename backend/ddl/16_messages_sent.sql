-- Source system: App
-- Personalized Email / WhatsApp messages generated and "sent" (mock) to customers
CREATE TABLE IF NOT EXISTS messages_sent (
    message_id   TEXT PRIMARY KEY,                    -- e.g. MSG00001
    customer_id  TEXT NOT NULL,
    agent_id     TEXT,
    product_id   TEXT,
    channel      TEXT NOT NULL,                       -- Email / WhatsApp
    subject      TEXT,                                -- email subject (null for WhatsApp)
    body         TEXT,                                -- personalized message body
    language     TEXT DEFAULT 'English',
    status       TEXT,                                -- Sent / Draft
    sent_at      TEXT,
    FOREIGN KEY (customer_id) REFERENCES customers(customer_id)
);
