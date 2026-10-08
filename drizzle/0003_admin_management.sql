CREATE TABLE IF NOT EXISTS item_moderation (
 item TEXT PRIMARY KEY REFERENCES items(id),
 reason TEXT NOT NULL,
 actor TEXT NOT NULL REFERENCES users(id),
 updated INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS admin_audit (
 id TEXT PRIMARY KEY,
 actor TEXT NOT NULL REFERENCES users(id),
 action TEXT NOT NULL,
 target TEXT NOT NULL,
 reason TEXT NOT NULL,
 created INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_admin_audit_created ON admin_audit(created);
