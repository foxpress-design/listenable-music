-- Subscribers
CREATE TABLE subscribers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  subscribed_at TEXT NOT NULL DEFAULT (datetime('now')),
  unsubscribed_at TEXT,
  source TEXT DEFAULT 'website'
);

CREATE INDEX idx_subscribers_email ON subscribers(email);

-- Admin sessions (magic link auth)
CREATE TABLE admin_sessions (
  token TEXT PRIMARY KEY,
  email TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'magic_link' CHECK(type IN ('magic_link', 'session')),
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  expires_at TEXT NOT NULL,
  used INTEGER DEFAULT 0
);

-- Unsubscribe tokens
CREATE TABLE unsubscribe_tokens (
  token TEXT PRIMARY KEY,
  subscriber_id INTEGER NOT NULL REFERENCES subscribers(id),
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Community submissions
CREATE TABLE submissions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  type TEXT NOT NULL CHECK(type IN ('photo', 'music')),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  caption TEXT,
  file_key TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending', 'approved', 'rejected')),
  submitted_at TEXT NOT NULL DEFAULT (datetime('now')),
  reviewed_at TEXT
);

CREATE INDEX idx_submissions_status ON submissions(status);

-- Play counts (migrate from KV to D1 for unified data)
CREATE TABLE play_counts (
  track_src TEXT PRIMARY KEY,
  count INTEGER NOT NULL DEFAULT 0,
  last_played TEXT
);

-- Page views / analytics events
CREATE TABLE analytics_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  event_type TEXT NOT NULL,
  event_data TEXT,
  ip_hash TEXT,
  user_agent TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX idx_analytics_created ON analytics_events(created_at);

-- Sent emails log
CREATE TABLE sent_emails (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  subject TEXT NOT NULL,
  body_preview TEXT,
  recipient_count INTEGER NOT NULL,
  sent_by TEXT NOT NULL,
  sent_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Bandcamp cache
CREATE TABLE bandcamp_cache (
  key TEXT PRIMARY KEY,
  data TEXT NOT NULL,
  fetched_at TEXT NOT NULL DEFAULT (datetime('now'))
);
