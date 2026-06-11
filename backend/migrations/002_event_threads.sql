CREATE TABLE IF NOT EXISTS event_threads (
  id TEXT PRIMARY KEY,
  event_id TEXT NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  image_url TEXT,
  image_key TEXT,
  status_after TEXT CHECK (status_after IN ('resolved', 'unresolved', 'pending')),
  priority_after TEXT CHECK (priority_after IN ('critical', 'high', 'medium', 'low')),
  created_by_user_id TEXT REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_event_threads_event_time ON event_threads(event_id, created_at DESC);
