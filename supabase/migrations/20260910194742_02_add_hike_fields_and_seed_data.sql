alter table public.hikes
  add column if not exists hike_type text,
  add column if not exists main_attraction text,
  add column if not exists difficulty_numeric text,
  add column if not exists scenery_rating numeric,
  add column if not exists overall_rating numeric,
  add column if not exists price_solo_usd integer,
  add column if not exists price_group_usd integer;

-- The production catalogue was seeded in the original migration history. Keep this
-- migration focused on the schema additions; current catalogue data remains managed
-- through the application's content migrations and production data.
