update public.hikes set
  starting_point = 'Le Dauguet / Tranquebar, Port Louis',
  terrain = 'A defined fitness-trail approach that becomes rocky and more natural toward the forest and Le Pouce route.',
  fitness_required = 'Easy for the Le Dauguet section; longer variants toward Le Pouce become substantially more demanding.',
  what_to_bring = ARRAY['Water','Trail shoes','Sun protection','Mosquito repellent'],
  safety_info = 'Trail conditions can become muddy and slippery after rain. The Le Dauguet-to-Le Pouce continuation is considerably harder than the local fitness trail.',
  logistics_source = 'https://www.wikiloc.com/hiking-trails/le-dauguet-128942518; https://www.visorando.com/randonnee-de-l-hippodrome-de-port-louis-au-sommet-/; https://lexpress.mu/node/426055',
  logistics_verified_at = now()
where name = 'Le Dauguet Exploration';

update public.hikes set
  distance_km = 8.0,
  elevation_gain_m = 485,
  starting_point = 'L’Embrasure / Black River area',
  terrain = 'Mountain trail with a demanding final section involving three scrambles to the summit cross.',
  fitness_required = 'Very strong fitness and confidence on steep, scrambling terrain.',
  what_to_bring = ARRAY['Water','Trail shoes with good grip','Sun protection','Light rain layer','Navigation track'],
  safety_info = 'The final ascent is very challenging and involves three scrambling sections. Conditions can change quickly in the south-west; avoid wet rock and confirm the route before departure.',
  logistics_source = 'https://www.wikiloc.com/hiking-trails/le-monde-174731234',
  logistics_verified_at = now()
where name = 'Le Monde';

update public.hikes set
  starting_point = 'Sugarcane fields near Beau Bois',
  terrain = 'Sugarcane-road approach followed by a short mountain trail; rocky/steep sections near the summit. Waterfall access is a separate route segment and may be slippery after rain.',
  fitness_required = 'Moderate fitness; allow extra time and care if the waterfall/swim extension is wet or slippery.',
  what_to_bring = ARRAY['Water','Trail shoes with good grip','Sun protection','Swimwear','Towel or quick-dry layer'],
  safety_info = 'The east Deux Mamelles route is the clearest documented route. The west route is reported as faint/overgrown. Waterfall sections can become slippery after rain; final access and swimming conditions should be checked on the day.',
  logistics_source = 'https://www.exploremauritius.org/?page_id=892; https://www.wikiloc.com/hiking-trails/2-mamelles-139261044; https://www.wikiloc.com/hiking-trails/deux-mamelles-80339459',
  logistics_verified_at = now()
where name = 'Deux Mamelles + Waterfalls';
