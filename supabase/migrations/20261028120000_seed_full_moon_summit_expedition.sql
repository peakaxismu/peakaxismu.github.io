-- Seed the June 2027 Full Moon Summit Expedition.
-- Logistics not provided by Peak Axis remain explicitly unconfirmed.
insert into public.expeditions (
  slug, name, destination, duration_days, difficulty, price_from,
  group_size_min, group_size_max, summit_elevation, next_departure,
  description, itinerary, included, not_included, packing_list, safety_notes, status
) values (
  'full-moon-summit-expedition',
  'Full Moon Summit Expedition',
  'Réunion Island',
  4,
  'To be confirmed',
  'Price on request',
  0,
  0,
  null,
  '18–21 June 2027',
  'An unforgettable journey combining mountain adventure, spectacular waterfalls, scenic landscapes and a full moon summit experience. Meals are not included in the package.',
  '[{"day_number":"01","title":"Arrival & Cilaos Discovery","duration_note":"FRIDAY · 18 JUNE 2027","body":"Arrival in Réunion Island\n\nArrive at Roland Garros International Airport, Réunion Island.\n\nMeet your transfer and depart towards the spectacular mountain cirque of Cilaos.\n\nEnjoy a scenic drive through the famous winding road, surrounded by dramatic mountain landscapes and breathtaking viewpoints.\n\nUpon arrival in Cilaos, check in to your accommodation and enjoy some time to relax.\n\nSightseeing & Discovery\n\nCilaos Village\nDiscover the charming mountain village of Cilaos, known for its beautiful scenery, traditional architecture and unique atmosphere.\n\nMare à Joncs\nEnjoy a relaxing visit to this beautiful lake in Cilaos, surrounded by mountains and offering a peaceful setting.\n\nRoche Merveilleuse Viewpoint\nDiscover one of the spectacular viewpoints overlooking Cilaos and its dramatic volcanic cirque. Enjoy the panoramic mountain scenery and take memorable photographs.\n\nThe remainder of the day is dedicated to rest and preparation for the upcoming mountain expedition.\n\nOvernight: Cilaos"},{"day_number":"02","title":"Ascent to Gîte de la Caverne Dufour","duration_note":"SATURDAY · 19 JUNE 2027","body":"In the morning, prepare for the mountain adventure towards Gîte de la Caverne Dufour.\n\nBegin the ascent through the spectacular mountain landscapes of Réunion Island. The trail gradually climbs through forested sections and high-altitude terrain, offering beautiful views along the way.\n\nEnjoy the changing scenery as you approach the mountain refuge.\n\nUpon arrival at Gîte de la Caverne Dufour, settle in and take time to rest.\n\nPrepare for the early-morning summit attempt beneath the full moon.\n\nEnjoy the unique atmosphere of the mountain refuge before an early night.\n\nOvernight: Gîte de la Caverne Dufour\nMeals: As per refuge arrangement"},{"day_number":"03","title":"Full Moon Summit & Sunrise Experience","duration_note":"SUNDAY · 20 JUNE 2027","body":"The highlight of the expedition\n\nDepart the refuge during the early hours of the morning and begin the final ascent towards Piton des Neiges.\n\nExperience the mountain under the glow of the full moon as you make your way towards the summit.\n\nReach the summit of Piton des Neiges, the highest point of Réunion Island, and enjoy the spectacular sunrise.\n\nTake time to appreciate the breathtaking panoramic views across the island''s volcanic landscapes.\n\nCapture unforgettable photographs and enjoy this extraordinary mountain experience.\n\nFollowing the summit experience, begin the descent towards Cilaos.\n\nArrive in Cilaos and enjoy a well-deserved rest after the mountain adventure. The remainder of the day is reserved for recovery and relaxation.\n\nOvernight: Cilaos"},{"day_number":"04","title":"Salazie, Waterfalls & Return to Mauritius","duration_note":"MONDAY · 21 JUNE 2027","body":"In the morning, depart Cilaos and travel towards the spectacular cirque of Salazie.\n\nEnjoy a scenic drive through the beautiful landscapes of Réunion Island, passing lush vegetation, dramatic mountain scenery and traditional villages.\n\nSightseeing & Discovery\n\nCascade du Voile de la Mariée\nDiscover one of Réunion Island''s most famous waterfalls. Located in the spectacular cirque of Salazie, this impressive cascade stretches across the mountainside, creating a beautiful natural spectacle. Enjoy the scenic viewpoint and take photographs of the waterfall surrounded by lush green landscapes.\n\nVillage of Salazie\nEnjoy a visit to the charming village of Salazie, surrounded by mountains and beautiful natural scenery. Discover the peaceful atmosphere of this picturesque mountain village.\n\nHell-Bourg\nContinue towards Hell-Bourg, one of the most beautiful villages in Réunion Island. Enjoy a short discovery of the village, known for its traditional Creole architecture, charming streets and mountain surroundings. Take time to explore and capture photographs of this picturesque destination.\n\nFollowing the sightseeing programme, depart towards Roland Garros International Airport.\n\nReturn flight: Réunion Island – Mauritius\nDeparture: Subject to flight schedules"}]'::jsonb,
  '[]'::jsonb,
  '[]'::jsonb,
  '[]'::jsonb,
  null,
  'published'
)
on conflict (slug) do update set
  name = excluded.name,
  destination = excluded.destination,
  duration_days = excluded.duration_days,
  difficulty = excluded.difficulty,
  price_from = excluded.price_from,
  group_size_min = excluded.group_size_min,
  group_size_max = excluded.group_size_max,
  summit_elevation = excluded.summit_elevation,
  next_departure = excluded.next_departure,
  description = excluded.description,
  itinerary = excluded.itinerary,
  included = excluded.included,
  not_included = excluded.not_included,
  packing_list = excluded.packing_list,
  safety_notes = excluded.safety_notes,
  status = excluded.status;
