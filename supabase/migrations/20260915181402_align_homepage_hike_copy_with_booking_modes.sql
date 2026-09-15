update public.homepage_content
set
  hero_primary_cta = 'Explore guided hikes',
  hikes_title = 'Guided hikes across Mauritius.',
  hikes_body = 'Explore Mauritius mountain ranges and nature reserves on guided hikes available on demand. We handle navigation, safety, and pacing so you can focus on the trail.',
  hikes_primary_cta = 'Explore all hikes',
  updated_at = now()
where id = true;
