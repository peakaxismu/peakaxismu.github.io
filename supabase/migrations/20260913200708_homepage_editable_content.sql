-- Reconstructed from the production migration ledger.
-- The following migration establishes the editable homepage record before the
-- subsequent homepage/Instagram migration adds its companion content tables.

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
  updated_at timestamptz not null default now()
);

alter table public.homepage_content enable row level security;
drop policy if exists "Public can read homepage content" on public.homepage_content;
create policy "Public can read homepage content" on public.homepage_content for select to anon,authenticated using (true);
revoke all on public.homepage_content from anon,authenticated;
grant select on public.homepage_content to anon,authenticated;
insert into public.homepage_content(id) values (true) on conflict (id) do nothing;
