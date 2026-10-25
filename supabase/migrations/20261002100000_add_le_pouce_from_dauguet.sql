-- Add Le Pouce from Dauguet to the published hike catalogue.
-- Source references:
-- https://www.wikiloc.com/hiking-trails/moka-le-pouce-le-dauguet-port-louis-248826199
-- https://www.tripadvisor.com/ShowUserReviews-g293817-d1576842-r782136358-Le_Pouce-Port_Louis.html

insert into public.hikes (
  name,
  hike_type,
  difficulty,
  difficulty_numeric,
  duration,
  location,
  price,
  description,
  status,
  main_attraction,
  distance_km,
  elevation_gain_m,
  starting_point,
  terrain,
  fitness_required,
  what_to_bring,
  safety_info,
  experience_types,
  region,
  booking_type,
  rating_label,
  logistics_source,
  logistics_verified_at,
  trail_condition_status,
  trail_condition_note,
  trail_condition_updated_at
)
select
  'Le Pouce from Dauguet',
  'Mountain / summit',
  'challenging',
  '7/10',
  '4½–5 hr',
  'Le Dauguet / Tranquebar, Port Louis',
  '$50 pp',
  'Longer summit hike from Le Dauguet to the 812 m summit of Le Pouce, combining a sustained climb, mountain-pass terrain and broad views over Port Louis and the Moka Range.',
  'published',
  'Le Pouce summit and panoramic Port Louis / Moka Range views',
  13.6,
  762,
  'Le Dauguet / Tranquebar, Port Louis',
  'Sustained uphill trail from Le Dauguet with a mountain pass, steeper upper sections and a short rocky summit approach. The route is exposed in places and becomes more demanding on the climb toward Le Pouce.',
  'Good fitness required. This is a substantially longer and more demanding approach than the shorter Moka-side Le Pouce hike, with significant elevation gain and a long return.',
  array['Water','Trail shoes with good grip','Sun protection','Hat','Light rain layer','Snacks'],
  'The summit route is exposed in places and conditions can become slippery after rain. Start early to reduce heat exposure, carry enough water for the full outing, and avoid the summit in strong wind, heavy rain or poor visibility. Confirm current trail/access conditions before departure.',
  array['summit','viewpoint','mountain','hiking'],
  'Port Louis',
  'on_demand',
  'Peak Axis rating',
  'https://www.wikiloc.com/hiking-trails/moka-le-pouce-le-dauguet-port-louis-248826199; https://www.tripadvisor.com/ShowUserReviews-g293817-d1576842-r782136358-Le_Pouce-Port_Louis.html',
  now(),
  'conditions_to_confirm',
  'Route sources describe a long, demanding approach from Le Dauguet with significant elevation gain. Confirm current access, trail condition, weather and visibility before departure.',
  now()
where not exists (
  select 1 from public.hikes where lower(name) = lower('Le Pouce from Dauguet')
);