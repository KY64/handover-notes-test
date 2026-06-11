CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS events (
  id TEXT PRIMARY KEY,
  hotel_id TEXT NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL,
  shift_id TEXT NOT NULL,
  business_date DATE NOT NULL,
  type TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('resolved', 'unresolved', 'pending')),
  room TEXT,
  guest TEXT,
  description TEXT NOT NULL,
  source TEXT NOT NULL CHECK (source IN ('seed', 'manual', 'reconciliation')),
  source_ref TEXT,
  created_by_user_id TEXT REFERENCES users(id),
  updated_by_user_id TEXT REFERENCES users(id),
  priority_override TEXT CHECK (priority_override IN ('critical', 'high', 'medium', 'low')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_events_hotel_status_time ON events(hotel_id, status, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_events_shift ON events(shift_id);
CREATE INDEX IF NOT EXISTS idx_events_room ON events(room);

CREATE TABLE IF NOT EXISTS raw_notes (
  id TEXT PRIMARY KEY,
  hotel_id TEXT NOT NULL,
  raw_text TEXT NOT NULL,
  source_label TEXT,
  submitted_by_user_id TEXT REFERENCES users(id),
  model TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS reconciliation_batches (
  id TEXT PRIMARY KEY,
  raw_note_id TEXT NOT NULL REFERENCES raw_notes(id),
  model TEXT NOT NULL,
  ai_response_json JSONB NOT NULL,
  created_event_ids TEXT[] NOT NULL DEFAULT '{}',
  created_by_user_id TEXT REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS event_status_history (
  id TEXT PRIMARY KEY,
  event_id TEXT NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  old_status TEXT,
  new_status TEXT NOT NULL,
  changed_by_user_id TEXT REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
