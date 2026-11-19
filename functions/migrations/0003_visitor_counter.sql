CREATE TABLE IF NOT EXISTS visitor_daily (
  day TEXT PRIMARY KEY NOT NULL,
  visits INTEGER NOT NULL DEFAULT 0,
  unique_visitors INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS visitor_daily_seen (
  day TEXT NOT NULL,
  visitor_hash TEXT NOT NULL,
  PRIMARY KEY (day, visitor_hash),
  FOREIGN KEY (day) REFERENCES visitor_daily(day) ON DELETE CASCADE
) WITHOUT ROWID;

CREATE TRIGGER IF NOT EXISTS visitor_daily_seen_increment
AFTER INSERT ON visitor_daily_seen
BEGIN
  UPDATE visitor_daily
  SET unique_visitors = unique_visitors + 1
  WHERE day = NEW.day;
END;

CREATE TABLE IF NOT EXISTS visitor_presence (
  visitor_hash TEXT PRIMARY KEY NOT NULL,
  last_seen_at INTEGER NOT NULL
) WITHOUT ROWID;

CREATE INDEX IF NOT EXISTS visitor_presence_last_seen_idx
  ON visitor_presence (last_seen_at);
