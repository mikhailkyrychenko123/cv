CREATE TABLE IF NOT EXISTS product_requests (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT NOT NULL CHECK (length(email) <= 254),
  product_name TEXT NOT NULL CHECK (length(product_name) <= 160),
  consent_at TEXT NOT NULL,
  notice_version TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS product_requests_consent_at_idx
  ON product_requests (consent_at DESC);
