-- Peak Axis production schema baseline.
-- This migration captures the current remote public schema so local resets and CI
-- no longer depend on migration files that were lost from the repository history.
-- Existing production data is intentionally not part of the schema baseline.

create table if not exists public.hikes (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  difficulty text not null check (difficulty = any (array['easy'::text, 'moderate'::text, 'challenging'::text])),
  date text,
  duration text not null,
  location text not null,
  price text not null,
  spots_total integer not null default 10,
  spots_remaining integer not null default 10,
  description text,
  status text not null default 'published' check (status = any (array['draft'::text, 'published'::text])),
  created_at timestamptz not null default now(),
  hike_type text,
  main_attraction text,
  difficulty_numeric text,
  scenery_rating numeric,
  overall_rating numeric,
  price_solo_usd integer,
  price_group_usd integer,
  distance_km numeric,
  elevation_gain_m integer,
  starting_point text,
  meeting_point text,
  transport_options text,
  fitness_required text,
  terrain text,
  what_to_bring text[] not null default '{}',
  included text[] not null default '{}',
  excluded text[] not null default '{}',
  safety_info text,
  weather_policy text,
  age_requirements text,
  min_participants integer,
  max_participants integer,
  experience_types text[] not null default '{}',
  region text,
  booking_type text not null default 'on_demand',
  rating_label text not null default 'Peak Axis rating',
  logistics_source text,
  logistics_verified_at timestamptz,
  trail_condition_status text not null default 'open' check (trail_condition_status = any (array['open'::text, 'conditions_to_confirm'::text, 'temporarily_unsuitable'::text, 'closed'::text])),
  trail_condition_note text,
  trail_condition_updated_at timestamptz
);

create table if not exists public.expeditions (
  id uuid primary key default gen_random_uuid(),
  slug text unique,
  name text not null,
  destination text not null,
  duration_days integer not null default 1,
  difficulty text not null,
  price_from text not null,
  group_size_min integer not null default 4,
  group_size_max integer not null default 12,
  summit_elevation text,
  next_departure text,
  description text,
  itinerary jsonb not null default '[]',
  included jsonb not null default '[]',
  not_included jsonb not null default '[]',
  packing_list jsonb not null default '[]',
  safety_notes text,
  status text not null default 'published' check (status = any (array['draft'::text, 'published'::text])),
  created_at timestamptz not null default now()
);

create table if not exists public.team_building_packages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  type text not null check (type = any (array['outdoor'::text, 'indoor'::text])),
  description text not null,
  status text not null default 'published' check (status = any (array['draft'::text, 'published'::text])),
  created_at timestamptz not null default now()
);

create table if not exists public.enquiries (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  phone text,
  interest_type text not null check (interest_type = any (array['hike'::text, 'private_hike'::text, 'expedition'::text, 'team'::text, 'activity'::text])),
  reference_id text,
  preferred_date text,
  group_size text,
  message text,
  status text not null default 'new' check (status = any (array['new'::text, 'contacted'::text, 'quoted'::text, 'confirmed'::text, 'completed'::text, 'closed'::text])),
  submitted_at timestamptz not null default now()
);

create table if not exists public.waterfalls (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  location text not null,
  duration text not null,
  status text not null default 'published' check (status = any (array['draft'::text, 'published'::text])),
  short_line text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.journal_posts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  category text not null,
  summary text not null,
  content text not null,
  status text not null default 'published' check (status = any (array['draft'::text, 'published'::text])),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.site_settings (
  id boolean primary key default true check (id = true),
  instagram_handle text not null default 'peak.axis',
  instagram_url text not null default 'https://www.instagram.com/peak.axis',
  updated_at timestamptz not null default now()
);

create table if not exists public.testimonials (
  id uuid primary key default gen_random_uuid(),
  quote text not null,
  name text not null,
  activity text not null,
  status text not null default 'published' check (status = any (array['draft'::text, 'published'::text])),
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.homepage_content (
  id boolean primary key default true check (id = true),
  hero_title text not null default 'Adventure',
  hero_emphasis text not null default 'without',
  hero_title_suffix text not null default 'borders.',
  hero_subtitle text not null default 'Mauritius ridge trails, active volcano treks in La Réunion, and team expeditions built around real terrain.',
  hero_primary_cta text not null default 'View upcoming hikes',
  hero_primary_url text not null default '/hikes',
  hero_secondary_cta text not null default 'Featured expedition',
  hero_secondary_url text not null default '/expeditions/piton-de-la-fournaise',
  elevation_1_value text not null default '828m',
  elevation_1_label text not null default 'Highest peak (Mauritius)',
  elevation_2_value text not null default '2,632m',
  elevation_2_label text not null default 'Volcano rim (Réunion)',
  elevation_3_value text not null default '01',
  elevation_3_label text not null default 'Single point of contact',
  intro_title text not null default 'From island trails to island volcanoes.',
  intro_body text not null default 'Peak Axis operates between Mauritius and La Réunion. We run weekly group hikes, multi-day crater treks, and corporate team days — designed for people who want terrain, not tourist walk-throughs.',
  hikes_title text not null default 'Group hikes across Mauritius, most weekends.',
  hikes_body text not null default 'Join guided group walks through Mauritius’ mountain ranges and nature reserves. We handle navigation, safety, and pacing so you can focus on the trail.',
  hikes_primary_cta text not null default 'View all upcoming hikes',
  hikes_primary_url text not null default '/hikes',
  hikes_secondary_cta text not null default 'Book a private hike',
  hikes_secondary_url text not null default '/enquire?interest=private_hike',
  expeditions_title text not null default 'Réunion’s volcanoes, one expedition at a time.',
  expeditions_body text not null default 'Multi-day wilderness journeys beyond Mauritius. Crossing active calderas, lava fields, and high altitude trails with full mountain logistics and certified guides.',
  expeditions_cta text not null default 'Explore Piton de la Fournaise',
  expeditions_url text not null default '/expeditions/piton-de-la-fournaise',
  team_title text not null default 'Teams work better after they’ve climbed something together.',
  team_body text not null default 'Custom outdoor challenges designed for company teams. From ridge walks to orienteering tasks that build trust, clear minds, and test problem-solving outside the office.',
  team_cta text not null default 'Enquire for your team',
  team_url text not null default '/enquire?interest=team',
  activities_title text not null default 'Indoor and outdoor, for any group.',
  activities_body text not null default 'Tailored group experiences — half-day workshops, nature walks, and adventure sessions for schools, clubs, or private gatherings.',
  activities_cta text not null default 'Plan a custom activity',
  activities_url text not null default '/enquire?interest=activity',
  featured_expedition_label text not null default 'FEATURED EXPEDITION · LA RÉUNION',
  featured_expedition_description text not null default 'A 3-day trek across the Plaine des Sables and into the active Enclos Fouqué caldera. Small group, certified guide, full mountain logistics included.',
  featured_expedition_elevation text not null default '2,632m',
  featured_expedition_elevation_label text not null default 'Summit elev.',
  featured_expedition_duration_label text not null default 'Duration',
  featured_expedition_departure_label text not null default 'Next departure',
  featured_expedition_cta text not null default 'View itinerary & details',
  testimonials_kicker text not null default 'TESTIMONIALS',
  testimonials_title text not null default 'What our hikers say',
  testimonials_subtitle text not null default 'Real feedback from recent hikes and expeditions across Mauritius and Réunion.',
  positioning_title text not null default 'You’re not just here for a hike.',
  positioning_emphasis text not null default 'further',
  positioning_prefix text not null default 'You’re here to go',
  why_1_title text not null default 'Small, fixed groups',
  why_1_body text not null default 'We cap numbers so every group moves cleanly, stays safe, and leaves minimal trace on the mountain.',
  why_2_title text not null default 'Real mountain leadership',
  why_2_body text not null default 'Guides who know the weather windows, the unmarked ridge paths, and how to pace a group over hours.',
  why_3_title text not null default 'Zero fluff logistics',
  why_3_body text not null default 'Clear briefings, exact gear lists, straight pricing. You know what you’re getting before you lace up.',
  why_4_title text not null default 'Safety first, always',
  why_4_body text not null default 'Every guide is briefed on weather windows, terrain risk, and emergency protocol before a single boot hits the trail.',
  instagram_kicker text not null default 'INSTAGRAM TRAIL FEED',
  instagram_title_prefix text not null default 'Follow the trail —',
  instagram_subtitle text not null default 'Real moments from real hikes. Tag us in yours.',
  instagram_overlay_cta text not null default 'View on Instagram ↗',
  cta_title text not null default 'Ready for your next adventure?',
  cta_body text not null default 'Tell us what you’re planning — whether it’s a solo spot on a weekend hike or an expedition for your team.',
  cta_button text not null default 'Get in touch',
  cta_url text not null default '/enquire',
  updated_at timestamptz not null default now()
);

create table if not exists public.instagram_posts (
  id uuid primary key default gen_random_uuid(),
  image_url text not null,
  post_url text not null,
  caption text not null default '',
  status text not null default 'published' check (status = any (array['draft'::text, 'published'::text])),
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  embed_code text not null default ''
);

create unique index if not exists expeditions_slug_key on public.expeditions using btree (slug);

alter table public.hikes enable row level security;
alter table public.expeditions enable row level security;
alter table public.team_building_packages enable row level security;
alter table public.enquiries enable row level security;
alter table public.waterfalls enable row level security;
alter table public.journal_posts enable row level security;
alter table public.site_settings enable row level security;
alter table public.testimonials enable row level security;
alter table public.homepage_content enable row level security;
alter table public.instagram_posts enable row level security;

create policy "Anyone can view hikes" on public.hikes for select to anon, authenticated using (true);
create policy "Anyone can view expeditions" on public.expeditions for select to anon, authenticated using (true);
create policy "Anyone can view team building packages" on public.team_building_packages for select to anon, authenticated using (true);
create policy "Allow anonymous enquiry submissions" on public.enquiries for insert to anon with check ((length(trim(email)) >= 3 and length(trim(email)) <= 320) and (length(trim(message)) >= 1 and length(trim(message)) <= 5000));
create policy "Public can read published waterfalls" on public.waterfalls for select to public using (status = 'published');
create policy "Public can read published journal posts" on public.journal_posts for select to public using (status = 'published');
create policy "Public can read site settings" on public.site_settings for select to public using (true);
create policy "Public can read published testimonials" on public.testimonials for select to public using (status = 'published');
create policy "Public can read homepage content" on public.homepage_content for select to anon, authenticated using (true);
create policy "Public can read published instagram posts" on public.instagram_posts for select to anon, authenticated using (status = 'published');
