alter table public.hikes
  add column if not exists distance_km numeric,
  add column if not exists elevation_gain_m integer,
  add column if not exists starting_point text,
  add column if not exists meeting_point text,
  add column if not exists transport_options text,
  add column if not exists fitness_required text,
  add column if not exists terrain text,
  add column if not exists what_to_bring text[] not null default '{}',
  add column if not exists included text[] not null default '{}',
  add column if not exists excluded text[] not null default '{}',
  add column if not exists safety_info text,
  add column if not exists weather_policy text,
  add column if not exists age_requirements text,
  add column if not exists min_participants integer,
  add column if not exists max_participants integer,
  add column if not exists experience_types text[] not null default '{}',
  add column if not exists region text,
  add column if not exists booking_type text not null default 'on_demand',
  add column if not exists rating_label text not null default 'Peak Axis rating';

update public.hikes set booking_type = 'on_demand' where booking_type is null;
update public.hikes set rating_label = 'Peak Axis rating' where rating_label is null or rating_label = '';
