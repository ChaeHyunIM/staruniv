-- StarUniv Seed Data (dummy)
-- 8 crews, ~50 players, 5 tournaments
-- ON CONFLICT DO NOTHING for idempotency

BEGIN;

-- Crews
INSERT INTO crews (name) VALUES
  ('서강대'),
  ('연세대'),
  ('고려대'),
  ('한양대'),
  ('성균관대'),
  ('중앙대'),
  ('경희대'),
  ('이화여대')
ON CONFLICT (name) DO NOTHING;

-- Players
INSERT INTO players (nickname, race, tier, gender, crew_id, is_fa) VALUES
  -- 서강대 (crew_id = 1)
  ('Flash', 'T', 'S', 'M', (SELECT id FROM crews WHERE name = '서강대'), false),
  ('Mind', 'T', 'A', 'M', (SELECT id FROM crews WHERE name = '서강대'), false),
  ('Light', 'T', 'A', 'M', (SELECT id FROM crews WHERE name = '서강대'), false),
  ('Sharp', 'T', 'B', 'M', (SELECT id FROM crews WHERE name = '서강대'), false),
  ('Barracks', 'T', 'B', 'M', (SELECT id FROM crews WHERE name = '서강대'), false),
  ('Miso', 'P', 'B', 'F', (SELECT id FROM crews WHERE name = '서강대'), false),

  -- 연세대 (crew_id = 2)
  ('Rain', 'P', 'S', 'M', (SELECT id FROM crews WHERE name = '연세대'), false),
  ('Snow', 'P', 'A', 'M', (SELECT id FROM crews WHERE name = '연세대'), false),
  ('Best', 'P', 'A', 'M', (SELECT id FROM crews WHERE name = '연세대'), false),
  ('Mini', 'P', 'B', 'M', (SELECT id FROM crews WHERE name = '연세대'), false),
  ('Stork', 'P', 'A', 'M', (SELECT id FROM crews WHERE name = '연세대'), false),
  ('Yuri', 'Z', 'C', 'F', (SELECT id FROM crews WHERE name = '연세대'), false),

  -- 고려대 (crew_id = 3)
  ('Jaedong', 'Z', 'S', 'M', (SELECT id FROM crews WHERE name = '고려대'), false),
  ('Effort', 'Z', 'A', 'M', (SELECT id FROM crews WHERE name = '고려대'), false),
  ('Soulkey', 'Z', 'A', 'M', (SELECT id FROM crews WHERE name = '고려대'), false),
  ('Calm', 'Z', 'B', 'M', (SELECT id FROM crews WHERE name = '고려대'), false),
  ('Hydra', 'Z', 'B', 'M', (SELECT id FROM crews WHERE name = '고려대'), false),
  ('Queen', 'Z', 'C', 'F', (SELECT id FROM crews WHERE name = '고려대'), false),

  -- 한양대 (crew_id = 4)
  ('Bisu', 'P', 'S', 'M', (SELECT id FROM crews WHERE name = '한양대'), false),
  ('Shuttle', 'P', 'A', 'M', (SELECT id FROM crews WHERE name = '한양대'), false),
  ('free', 'P', 'B', 'M', (SELECT id FROM crews WHERE name = '한양대'), false),
  ('Movie', 'T', 'B', 'M', (SELECT id FROM crews WHERE name = '한양대'), false),
  ('Nal_rA', 'P', 'A', 'M', (SELECT id FROM crews WHERE name = '한양대'), false),
  ('Hani', 'T', 'C', 'F', (SELECT id FROM crews WHERE name = '한양대'), false),

  -- 성균관대 (crew_id = 5)
  ('EffOrt', 'Z', 'A', 'M', (SELECT id FROM crews WHERE name = '성균관대'), false),
  ('Larva', 'Z', 'S', 'M', (SELECT id FROM crews WHERE name = '성균관대'), false),
  ('hero', 'Z', 'A', 'M', (SELECT id FROM crews WHERE name = '성균관대'), false),
  ('Shine', 'Z', 'B', 'M', (SELECT id FROM crews WHERE name = '성균관대'), false),
  ('Modesty', 'T', 'B', 'M', (SELECT id FROM crews WHERE name = '성균관대'), false),
  ('Luna', 'P', 'C', 'F', (SELECT id FROM crews WHERE name = '성균관대'), false),

  -- 중앙대 (crew_id = 6)
  ('Last', 'T', 'S', 'M', (SELECT id FROM crews WHERE name = '중앙대'), false),
  ('Rush', 'T', 'A', 'M', (SELECT id FROM crews WHERE name = '중앙대'), false),
  ('sSak', 'P', 'B', 'M', (SELECT id FROM crews WHERE name = '중앙대'), false),
  ('Sea', 'T', 'A', 'M', (SELECT id FROM crews WHERE name = '중앙대'), false),
  ('Iris', 'Z', 'C', 'F', (SELECT id FROM crews WHERE name = '중앙대'), false),

  -- 경희대 (crew_id = 7)
  ('JangBi', 'P', 'A', 'M', (SELECT id FROM crews WHERE name = '경희대'), false),
  ('GuemChi', 'P', 'B', 'M', (SELECT id FROM crews WHERE name = '경희대'), false),
  ('Killer', 'Z', 'B', 'M', (SELECT id FROM crews WHERE name = '경희대'), false),
  ('Leta', 'T', 'A', 'M', (SELECT id FROM crews WHERE name = '경희대'), false),
  ('Danbi', 'T', 'C', 'F', (SELECT id FROM crews WHERE name = '경희대'), false),

  -- 이화여대 (crew_id = 8)
  ('Sakura', 'P', 'B', 'F', (SELECT id FROM crews WHERE name = '이화여대'), false),
  ('Dahlia', 'Z', 'B', 'F', (SELECT id FROM crews WHERE name = '이화여대'), false),
  ('Violet', 'T', 'C', 'F', (SELECT id FROM crews WHERE name = '이화여대'), false),
  ('Rose', 'P', 'C', 'F', (SELECT id FROM crews WHERE name = '이화여대'), false),
  ('Lily', 'Z', 'C', 'F', (SELECT id FROM crews WHERE name = '이화여대'), false)
ON CONFLICT (nickname) DO NOTHING;

-- FA Players (no crew)
INSERT INTO players (nickname, race, tier, gender, crew_id, is_fa) VALUES
  ('Boxer', 'T', 'A', 'M', NULL, true),
  ('NaDa', 'T', 'A', 'M', NULL, true),
  ('Savior', 'Z', 'B', 'M', NULL, true),
  ('Reach', 'P', 'B', 'M', NULL, true),
  ('Miyu', 'Z', 'B', 'F', NULL, true),
  ('Nana', 'P', 'C', 'F', NULL, true)
ON CONFLICT (nickname) DO NOTHING;

-- Tournaments
INSERT INTO tournaments (name, year, winner_crew_id, status) VALUES
  ('제1회 스타대학리그', 2023, (SELECT id FROM crews WHERE name = '서강대'), 'completed'),
  ('제2회 스타대학리그', 2023, (SELECT id FROM crews WHERE name = '고려대'), 'completed'),
  ('제3회 스타대학리그', 2024, (SELECT id FROM crews WHERE name = '연세대'), 'completed'),
  ('제4회 스타대학리그', 2024, (SELECT id FROM crews WHERE name = '서강대'), 'completed'),
  ('제5회 스타대학리그', 2025, (SELECT id FROM crews WHERE name = '성균관대'), 'completed')
ON CONFLICT DO NOTHING;

-- Tier Version
INSERT INTO tier_versions (version, notes) VALUES
  ('v1.0', '초기 티어표 설정')
ON CONFLICT DO NOTHING;

COMMIT;
