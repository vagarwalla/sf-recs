-- 004_sandys: add Sandy's (muffuletta sandwich shop, Upper Haight) as a rec.
--
-- New Orleans-style muffuletta shop at 1457 Haight St (between Masonic and
-- Ashbury). Mostly cold-cut sandwiches, but the vegetarian muffuletta swaps
-- the meats for Cajun-seasoned crispy roasted maitake mushrooms — that's the
-- order here.

insert into places (
  name, category, place_type, cuisine, neighborhood,
  dietary_options, gluten_free, notes, latitude, longitude, website, price_level
) values (
  'Sandy''s', 'rec', 'restaurant', 'Sandwiches', 'Upper Haight',
  'Veg', false,
  'New Orleans-style muffuletta shop. Get the vegetarian muffuletta — Cajun-roasted maitake mushrooms instead of cold cuts, with olive spread on a Firebrand sesame loaf.',
  37.7701, -122.4460,
  'https://www.sandysmuffs.com/', '$$'
)
on conflict (name) do update set
  category = excluded.category,
  cuisine = excluded.cuisine,
  neighborhood = excluded.neighborhood,
  dietary_options = excluded.dietary_options,
  notes = excluded.notes,
  website = excluded.website,
  price_level = excluded.price_level;
