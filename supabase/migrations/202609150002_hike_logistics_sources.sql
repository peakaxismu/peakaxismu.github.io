-- Track where researched hike logistics came from and when they were checked.
alter table public.hikes
  add column if not exists logistics_source text,
  add column if not exists logistics_verified_at timestamptz;

update public.hikes set
  distance_km = 3.7,
  elevation_gain_m = 402,
  starting_point = 'Moka trailhead',
  terrain = 'Grassy approach with a steeper final summit section; some hands-on scrambling near the summit.',
  fitness_required = 'Moderate fitness; the final summit section is steeper.',
  what_to_bring = ARRAY['Water','Trail shoes','Sun protection','Light extra layer for wind'],
  safety_info = 'The final summit section is steep and can be challenging in wet conditions. Check weather before departure.',
  logistics_source = 'https://blog.legendhill-mauritius.com/en/le-pouce-hike-mauritius/; https://www.exploremauritius.org/?page_id=459',
  logistics_verified_at = now()
where name = 'Le Pouce + Swim';

update public.hikes set
  distance_km = 2.25,
  elevation_gain_m = 183,
  starting_point = 'Sugarcane fields near Beau Bois (east route)',
  terrain = 'Clearer east route with a short, steep summit approach; the west route is reported as faint and overgrown.',
  fitness_required = 'Moderate fitness; route condition can change with weather.',
  what_to_bring = ARRAY['Water','Trail shoes','Sun protection'],
  safety_info = 'Route conditions vary. The west summit route is reported as faint/overgrown; wet conditions can make steeper sections slippery.',
  logistics_source = 'https://www.exploremauritius.org/?page_id=892',
  logistics_verified_at = now()
where name = 'Deux Mamelles';

update public.hikes set
  distance_km = 3.8,
  elevation_gain_m = 388,
  starting_point = 'End of Monseigneur Leen Road / Signal Mountain approach',
  terrain = 'Tarmac/vehicle track on the Signal Mountain approach, becoming rougher and less maintained toward Quoin Bluff; rocky summit section.',
  fitness_required = 'Easy to moderate on the Signal Mountain approach, with a more technical final section toward Quoin Bluff.',
  what_to_bring = ARRAY['Water','Trail shoes','Sun protection'],
  safety_info = 'The approach can become overgrown. The summit section has a more technical rocky step; use caution in wet conditions.',
  logistics_source = 'https://fitsy.com/mauritius-hiking-routes/90-signal-mountain-and-quoin-bluff; https://reliefmaps.io/en/topo/ReliefMapsAI/ReliefMapsAI2731381192751467948',
  logistics_verified_at = now()
where name = 'Quoin Bluff';

update public.hikes set
  distance_km = 4.25,
  elevation_gain_m = 191,
  starting_point = 'Batterie Dumas / Cité Martial area',
  terrain = 'Exposed ridge terrain with rocky sections and little shade.',
  fitness_required = 'Moderate fitness; exposed to sun and includes rocky sections.',
  what_to_bring = ARRAY['Water','Trail shoes','Sun protection','Hat'],
  safety_info = 'The route is exposed to sun. One route description notes a small rocky/cliff section near the summit; private land may be encountered on some approaches.',
  logistics_source = 'https://www.wikiloc.com/hiking-trails/batterie-dumas-mont-pretres-la-fenetre-priest-peak-vallee-pitot-port-louis-5446722; https://www.wikiloc.com/trails/hiking/mauritius/port-louis/carreau-lalo',
  logistics_verified_at = now()
where name = 'Priest''s Peak + La Fenêtre';

update public.hikes set
  distance_km = 4.4,
  elevation_gain_m = 560,
  starting_point = 'Tamarin / La Preneuse area',
  terrain = 'Steep sustained climb with rocky steps and fixed ropes on some sections.',
  fitness_required = 'Challenging fitness; sustained steep ascent and exposed/rocky sections.',
  what_to_bring = ARRAY['Water','Proper hiking shoes','Sun protection','Light extra layer'],
  safety_info = 'The route is steep and includes fixed-rope sections. Some route information indicates private land/permission considerations; confirm the current access route before departure.',
  logistics_source = 'https://real-estate-mauritius.mu/en/hiking-mauritius/la-tourelle-tamarin/; https://www.trekkingmauritius.com/tour/la-tourelle-de-tamarin-guided-hike/',
  logistics_verified_at = now()
where name = 'La Tourelle';

update public.hikes set
  distance_km = 2.9,
  starting_point = 'Alexandra Falls parking lot',
  terrain = 'Steep descent/ascent on a partly shaded trail with streams and slippery rock around the waterfall.',
  fitness_required = 'Challenging in wet conditions because of the steep, slippery sections.',
  what_to_bring = ARRAY['Water','Trail shoes with good grip','Sun/rain protection'],
  safety_info = 'The descent to the waterfall can be steep and slippery. Rocks around the falls are slick; take extra care near water and check weather conditions.',
  logistics_source = 'https://www.exploremauritius.org/?page_id=1051; https://mymauritius.org/en/mauritius-cascade-500-pieds/',
  logistics_verified_at = now()
where name = 'Cascade 500 Pieds';
