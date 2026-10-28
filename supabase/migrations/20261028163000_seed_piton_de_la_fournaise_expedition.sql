-- Ensure the feature-branch/staging database has the published Piton de la Fournaise expedition.
-- The public slug already exists in production. DO NOTHING on conflict so this seed
-- cannot overwrite production's existing record or any later admin edits.
insert into public.expeditions (
  slug, name, destination, duration_days, difficulty, price_from,
  group_size_min, group_size_max, summit_elevation, next_departure,
  description, itinerary, included, not_included, packing_list, safety_notes, status
) values (
  'piton-de-la-fournaise',
  'Piton de la Fournaise',
  'La Réunion',
  4,
  'Moderate–Challenging',
  'Rs 37,500',
  6,
  12,
  '2,632 m',
  '30 Oct 2026',
  'A four-day Réunion adventure starting from Roland Garros Airport, exploring Salazie’s waterfalls and Creole villages, a sunrise above Bois Court, the volcanic landscape of Piton de la Fournaise, a relaxed Saint-Pierre day, and a final sunrise at Maïdo before the airport.',
  $itinerary$[
    {
      "body": "Arrive at Roland Garros Airport and begin the journey into the mountains. Head towards Salazie for sightseeing at Cascade Voile de la Mariée, then continue to the beautiful Creole village of Hell-Bourg for a relaxed exploration, local lunch, and mountain scenery before continuing to Bourg-Murat for the night.",
      "title": "Airport · Cascade Voile de la Mariée · Salazie · Hell-Bourg",
      "day_number": "01",
      "duration_note": "Flight · Drive · Sightseeing · Full day"
    },
    {
      "body": "Early departure from Bourg-Murat for sunrise at Belvédère de Bois Court, followed by the drive to Pas de Bellecombe. Hike across the volcanic landscape of the Enclos Fouqué towards the Dolomieu crater rim, with a full day on the volcano before returning to Bourg-Murat.",
      "title": "Sunrise at Bois Court · Piton de la Fournaise",
      "day_number": "02",
      "duration_note": "Sunrise · 6–7 hrs trekking · Volcanic terrain"
    },
    {
      "body": "A slower day after the volcano. Head down to Saint-Pierre for shopping, lunch, a walk along the waterfront, and free time to explore before returning to Bourg-Murat and preparing for the move towards the west coast.",
      "title": "Saint-Pierre · Shopping · Relaxed Day",
      "day_number": "03",
      "duration_note": "Drive · Shopping · Leisure day"
    },
    {
      "body": "Very early departure for sunrise at Piton Maïdo and panoramic views over Mafate. Descend towards Saint-Paul for a short stop before continuing to Roland Garros Airport for the flight home.",
      "title": "Maïdo Sunrise · Saint-Paul · Airport",
      "day_number": "04",
      "duration_note": "Pre-dawn drive · Sunrise · Transfer to airport"
    }
  ]$itinerary$::jsonb,
  $included$["Roundtrip flights (MRU–RUN)", "3 nights accommodation", "Travel insurance (mandatory)", "Car "]$included$::jsonb,
  $notincluded$["Personal hiking gear", "Dinner & Lunch ", "Personal expenses & snacks"]$notincluded$::jsonb,
  $packing$[
    {
      "items": ["Sturdy hiking boots (broken in)", "Thermal base layers", "Wind/waterproof shell jacket", "Trekking trousers (no jeans)"],
      "category": "Footwear & Clothing"
    },
    {
      "items": ["30L daypack with rain cover", "Headlamp + extra batteries", "2L water capacity minimum", "Sunglasses & SPF 50 sunscreen"],
      "category": "Equipment"
    },
    {
      "items": ["Personal first aid & meds", "Passport (valid 6+ months)", "High-energy trail snacks"],
      "category": "Personal"
    }
  ]$packing$::jsonb,
  'Weather on Piton de la Fournaise can change rapidly. High altitude and volcanic terrain demand proper gear and attention to guide instructions at all times.',
  'published'
)
on conflict (slug) do nothing;
