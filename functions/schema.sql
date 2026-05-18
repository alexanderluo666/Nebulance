CREATE TABLE IF NOT EXISTS players (
  player_id TEXT PRIMARY KEY,
  data TEXT NOT NULL,
  high_score INTEGER NOT NULL DEFAULT 0,
  last_synced TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_players_high_score ON players (high_score DESC);
CREATE INDEX IF NOT EXISTS idx_players_updated_at ON players (updated_at);
