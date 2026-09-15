create extension if not exists pgcrypto;

create table if not exists public.hikes (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  difficulty text not null check (difficulty in ('easy','moderate','challenging')),
  date text,
  duration text not null,
  location text not null,
  price text not null,
  spots_total integer not null default 10,
  spots_remaining integer not null default 10,
  description text,
  status text not null default 'published' check (status in ('draft','published')),
  created_at timestamptz not null default now()
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
  itinerary jsonb not null default '[]'::jsonb,
  included jsonb not null default '[]'::jsonb,
  not_included jsonb not null default '[]'::jsonb,
  packing_list jsonb not null default '[]'::jsonb,
  safety_notes text,
  status text not null default 'published' check (status in ('draft','published')),
  created_at timestamptz not null default now()
);

create table if not exists public.team_building_packages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  type text not null check (type in ('outdoor','indoor')),
  description text not null,
  status text not null default 'published' check (status in ('draft','published')),
  created_at timestamptz not null default now()
);

create table if not exists public.enquiries (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  phone text,
  interest_type text not null check (interest_type in ('hike','private_hike','expedition','team','activity')),
  reference_id text,
  preferred_date text,
  group_size text,
  message text,
  status text not null default 'new' check (status in ('new','contacted','quoted','confirmed','completed','closed')),
  submitted_at timestamptz not null default now()
);

create table if not exists public.site_settings (
  id boolean primary key default true check (id = true),
  instagram_handle text not null default 'peak.axis',
  instagram_url text not null default 'https://www.instagram.com/peak.axis',
  updated_at timestamptz not null default now()
);

alter table public.hikes enable row level security;
alter table public.expeditions enable row level security;
alter table public.team_building_packages enable row level security;
alter table public.enquiries enable row level security;
alter table public.site_settings enable row level security;

create policy "Public can read published hikes" on public.hikes for select using (status = 'published');
create policy "Public can read published expeditions" on public.expeditions for select using (status = 'published');
create policy "Public can read published team packages" on public.team_building_packages for select using (status = 'published');
create policy "Public can read site settings" on public.site_settings for select using (true);

create policy "Anyone can submit enquiries" on public.enquiries for insert with check (true);

insert into public.site_settings (id) values (true) on conflict (id) do nothing;
