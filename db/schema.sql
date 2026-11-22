-- Diseño inicial para D1; no se aplica en GitHub Pages.
PRAGMA foreign_keys=ON;
CREATE TABLE clients (
 id TEXT PRIMARY KEY,
 name TEXT NOT NULL,
 phone TEXT NOT NULL UNIQUE CHECK(length(phone)=10 AND phone NOT GLOB '*[^0-9]*'),
 archived INTEGER NOT NULL DEFAULT 0 CHECK(archived IN (0,1)),
 created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE appointments (
 id TEXT PRIMARY KEY,
 client_id TEXT NOT NULL REFERENCES clients(id),
 date TEXT NOT NULL,
 time TEXT NOT NULL,
 duration_minutes INTEGER NOT NULL DEFAULT 60 CHECK(duration_minutes=60),
 status TEXT NOT NULL CHECK(status IN ('pending','confirmed','cancelled','rejected','expired','completed','noshow')),
 expires_at TEXT,
 created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE UNIQUE INDEX active_slot ON appointments(date,time) WHERE status IN ('pending','confirmed');
CREATE INDEX appointment_client_date ON appointments(client_id,date);
CREATE TABLE schedule_overrides(date TEXT PRIMARY KEY,open TEXT,close TEXT,closed INTEGER NOT NULL DEFAULT 0);
CREATE TABLE blocks(id TEXT PRIMARY KEY,date TEXT NOT NULL,start TEXT NOT NULL,end TEXT NOT NULL,reason TEXT);
CREATE INDEX block_date ON blocks(date);
CREATE TABLE settings(key TEXT PRIMARY KEY,value TEXT NOT NULL);
-- manager_id references the future authenticated manager, not a public client.
CREATE TABLE push_subscriptions(id TEXT PRIMARY KEY,manager_id TEXT NOT NULL,endpoint TEXT NOT NULL UNIQUE,p256dh TEXT NOT NULL,auth TEXT NOT NULL,created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE notification_outbox(id TEXT PRIMARY KEY,appointment_id TEXT NOT NULL REFERENCES appointments(id) ON DELETE CASCADE,attempts INTEGER NOT NULL DEFAULT 0,status TEXT NOT NULL DEFAULT 'pending',next_attempt_at TEXT,created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP);
