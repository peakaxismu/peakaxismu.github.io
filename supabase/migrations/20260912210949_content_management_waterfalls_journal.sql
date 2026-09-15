create table if not exists public.waterfalls (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  location text not null,
  duration text not null,
  price text not null,
  status text not null default 'ON DEMAND',
  short_line text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.journal_posts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  category text not null,
  summary text not null,
  content text,
  status text not null default 'published',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.waterfalls enable row level security;
alter table public.journal_posts enable row level security;

create policy "Public can read published waterfalls" on public.waterfalls
  for select using (true);
create policy "Public can read published journal posts" on public.journal_posts
  for select using (status = 'published');

create policy "Authenticated users manage waterfalls" on public.waterfalls
  for all to authenticated using (true) with check (true);
create policy "Authenticated users manage journal posts" on public.journal_posts
  for all to authenticated using (true) with check (true);

insert into public.waterfalls (name, location, duration, price, status, short_line)
select * from (values
  ('Tamarind Falls', 'Black River / Henrietta', '3–4 hrs', 'From Rs 1,500 pp', 'ON DEMAND', 'A guided gorge descent through forest and riverbeds to a chain of cascades and natural pools.'),
  ('Rochester Falls', 'Savanne', '2–3 hrs', 'From Rs 1,200 pp', 'ON DEMAND', 'A relaxed south-island waterfall outing combining forest walking, river scenery, and the iconic basalt falls.'),
  ('Chamarel Waterfall', 'Black River', '2–3 hrs', 'From Rs 1,200 pp', 'ON DEMAND', 'A scenic waterfall route around the Chamarel highlands, with viewpoints and forest trails.')
) as seed(name, location, duration, price, status, short_line)
where not exists (select 1 from public.waterfalls);

insert into public.journal_posts (title, category, summary, content, status)
select * from (values
  ('Piton de la Fournaise vs Piton des Neiges: Which One Should You Hike First?', 'EXPEDITIONS & VOLCANOES', 'A practical comparison of Réunion’s two famous peaks, from altitude and effort to scenery and preparation.', 'Piton de la Fournaise is the volcanic landscape choice: broad lava fields, an active caldera, and an early start to beat cloud build-up. Piton des Neiges is the bigger mountain objective, with a much larger elevation gain and a more demanding summit day. Choose Fournaise for volcanic terrain and a focused day outing; choose Neiges for the full mountain challenge.', 'published'),
  ('A Guide to Mauritius’ Best Waterfall Hikes', 'TRAIL GUIDES', 'What to expect from river crossings, slippery rocks, swimming stops, and guided waterfall routes in Mauritius.', 'Waterfall conditions change quickly with rainfall. Wear shoes with reliable grip, carry water and sun protection, and follow your guide around deep pools and slippery basalt. Tamarind Falls is a longer gorge experience, while shorter routes can work better for families and first-time hikers.', 'published'),
  ('What to Pack for a Multi-Day Réunion Expedition', 'GEAR & LOGISTICS', 'A compact packing checklist for high-altitude volcanic terrain and changing mountain weather.', 'Pack broken-in trail shoes, a waterproof shell, warm layers, a headlamp, sun protection, two water containers, personal medication, and enough food for delays. On overnight routes, keep your pack light and protect electronics and spare layers from rain.', 'published'),
  ('Best Time of Year to Hike in Mauritius and La Réunion', 'WEATHER & SEASONS', 'How rainfall, heat, wind, and mountain cloud affect trail planning across the islands.', 'Mauritius is generally more comfortable for hiking during the cooler, drier months, while Réunion’s high mountains can stay changeable even when the coast is sunny. Always check the forecast and local trail conditions before departure and allow flexibility for weather.', 'published')
) as seed(title, category, summary, content, status)
where not exists (select 1 from public.journal_posts);
