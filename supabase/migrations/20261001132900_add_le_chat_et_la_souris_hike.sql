-- Add Le Chat et la Souris to the published hike catalogue.
-- Source references:
-- https://www.exploremauritius.org/?page_id=1781
-- https://randopitons.re/randonnee/1890-maurice-montee-chat-souris-depuis-grand-sable

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
  'Le Chat et la Souris',
  'Mountain / viewpoint',
  'moderate',
  '6/10',
  '2–3 hr',
  'Grand Sable / Bambous Range',
  '$50 pp',
  'Scenic out-and-back hike through sugarcane, shaded ridge terrain and forest to a spectacular viewpoint below the summit rock, with chances to see Mauritius flying foxes. The final summit-rock scramble is optional.',
  'published',
  'Panoramic south-east lagoon and Bambous Range views; Mauritius flying foxes',
  5.8,
  599,
  'Sugarcane near Grand Sable',
  'Steep initial ascent from the sugarcane to the ridge, followed by a mostly shaded ridge trail that can be overgrown. Rocky sections become steeper near the viewpoint and summit rock.',
  'Moderate fitness. The main viewpoint is manageable for hikers comfortable with a sustained steep ascent; the optional summit-rock scramble requires confidence on exposed rocky terrain.',
  array['Water','Trail shoes with good grip','Sun protection','Mosquito repellent','Light rain layer'],
  'The trail can be overgrown and difficult to follow in places. The summit-rock ascent is optional but exposed, with a sheer drop on either side; skip it in wet, windy or uncertain conditions. Confirm current trail/access conditions before departure.',
  array['viewpoint','forest','hiking'],
  'Grand Port',
  'on_demand',
  'Peak Axis rating',
  'https://www.exploremauritius.org/?page_id=1781; https://randopitons.re/randonnee/1890-maurice-montee-chat-souris-depuis-grand-sable',
  now(),
  'conditions_to_confirm',
  'Route descriptions note overgrown/faint sections and an exposed summit-rock scramble. Confirm access, weather and trail conditions before departure.',
  now()
where not exists (
  select 1 from public.hikes where lower(name) = lower('Le Chat et la Souris')
);