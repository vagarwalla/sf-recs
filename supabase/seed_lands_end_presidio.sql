-- Seed: 8 vegetarian/vegan-friendly restaurants near Lands End & the Presidio.
-- Added as `explore` entries (personal wishlist). Top-reviewed picks matching the
-- existing taste profile (veg/vegan options, globally diverse, mostly $$),
-- including meat-serving spots with standout food + solid vegetarian options.
--
-- Idempotent: re-running will not create duplicates (ON CONFLICT on unique name).
-- Apply via Supabase SQL editor or: psql "$DATABASE_URL" -f supabase/seed_lands_end_presidio.sql

insert into places
  (name, category, place_type, cuisine, neighborhood, dietary_options, notes, latitude, longitude, website, price_level)
values
  ('Burma Superstar',  'explore', 'restaurant', 'Burmese',                  'Inner Richmond',     'Both', 'Tea-leaf salad + dedicated veg & tofu section. ~7,900 Yelp reviews, SF institution.', 37.782969, -122.461560, 'https://www.burmasuperstar.com/',     '$$'),
  ('Greens',           'explore', 'restaurant', 'Californian Vegetarian',   'Marina / Fort Mason', 'Both', 'Iconic SF vegetarian since 1979, Golden Gate Bridge views. 4.7 OpenTable.',          37.806470, -122.431330, 'https://greensrestaurant.com/',       '$$$'),
  ('Dalida',           'explore', 'restaurant', 'Eastern Mediterranean',    'Presidio',           'Both', 'Michelin-recommended + James Beard. Entire "Garden" section veg/vegan-able.',        37.799600, -122.456800, 'https://www.dalidasf.com/',           '$$$'),
  ('Pizzetta 211',     'explore', 'restaurant', 'Pizza',                    'Outer Richmond',     'Veg',  'Seasonal thin-crust, rotating veg pies, famous desserts. 4.7 stars.',                37.783800, -122.483600, 'https://www.pizzetta211.com/',        '$$'),
  ('Aziza',            'explore', 'restaurant', 'Moroccan',                 'Outer Richmond',     'Both', 'Michelin star. Strong veg, mostly dairy-free.',                                      37.780700, -122.480700, 'https://www.aziza-sf.com/',           '$$$'),
  ('Kitchen Istanbul', 'explore', 'restaurant', 'Turkish / Mediterranean',  'Inner Richmond',     'Both', 'SF Chronicle Top 100. Strong veg meze, family prix-fixe.',                           37.782950, -122.462050, 'https://www.kitchenistanbulsf.com/',  '$$'),
  ('Dragon Beaux',     'explore', 'restaurant', 'Cantonese / Dim Sum',      'Outer Richmond',     'Both', 'Veg dim sum + vegetarian hot pot broth. From the Koi Palace team.',                  37.780750, -122.479350, 'https://dragonbeaux.com/',            '$$'),
  ('Mandalay',         'explore', 'restaurant', 'Burmese',                  'Laurel Heights',     'Both', 'James Beard 2024 winner. Large veg section, many vegan.',                            37.784650, -122.463550, 'https://mandalaysf.com/',             '$$')
on conflict (name) do nothing;
