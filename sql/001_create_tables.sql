-- StarUniv DB Schema
-- crews, players, tournaments, tier_versions

BEGIN;

CREATE TABLE IF NOT EXISTS crews (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS players (
  id SERIAL PRIMARY KEY,
  nickname TEXT NOT NULL UNIQUE,
  race TEXT NOT NULL CHECK (race IN ('T', 'Z', 'P')),
  tier TEXT,
  gender TEXT DEFAULT 'M' CHECK (gender IN ('M', 'F')),
  crew_id INTEGER REFERENCES crews(id) ON DELETE SET NULL,
  is_fa BOOLEAN DEFAULT false,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS tournaments (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  year INTEGER NOT NULL,
  winner_crew_id INTEGER REFERENCES crews(id) ON DELETE SET NULL,
  status TEXT DEFAULT 'completed'
);

CREATE TABLE IF NOT EXISTS tier_versions (
  id SERIAL PRIMARY KEY,
  version TEXT NOT NULL,
  released_at TIMESTAMPTZ DEFAULT now(),
  notes TEXT
);

-- Indexes for frequently filtered columns
CREATE INDEX IF NOT EXISTS idx_players_race ON players(race);
CREATE INDEX IF NOT EXISTS idx_players_tier ON players(tier);
CREATE INDEX IF NOT EXISTS idx_players_crew_id ON players(crew_id);
CREATE INDEX IF NOT EXISTS idx_players_gender ON players(gender);
CREATE INDEX IF NOT EXISTS idx_players_is_fa ON players(is_fa);
CREATE INDEX IF NOT EXISTS idx_players_status ON players(status);
CREATE INDEX IF NOT EXISTS idx_tournaments_year ON tournaments(year);

COMMIT;
