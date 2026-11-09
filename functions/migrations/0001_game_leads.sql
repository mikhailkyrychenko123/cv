CREATE TABLE IF NOT EXISTS game_leads (
  email TEXT PRIMARY KEY NOT NULL CHECK (length(email) <= 254),
  consent_at TEXT NOT NULL,
  notice_version TEXT NOT NULL
) WITHOUT ROWID;
