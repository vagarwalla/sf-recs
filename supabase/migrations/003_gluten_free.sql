-- 002_gluten_free: add a gluten-free flag and mark places with gluten-free options.
--
-- gluten_free is an *additive* attribute, orthogonal to dietary_options
-- (Vegan/Veg/Both). A place can be vegetarian AND have gluten-free options,
-- so this is a separate boolean rather than a fourth dietary_options value.
-- The bar is "has gluten-free options for people who are intolerant" — not a
-- dedicated/celiac-safe kitchen.

alter table places
  add column if not exists gluten_free boolean not null default false;

create index if not exists idx_places_gluten_free on places (gluten_free);

-- Mark existing places that have gluten-free options.
-- Confirmed via menus/reviews or naturally gluten-free cuisines.
update places set gluten_free = true where name in (
  'Oren''s Hummus (3rd St)',       -- GF pita, hummus/eggplant; separate fryer
  'Pica Pica Arepa Kitchen',       -- 100% gluten-free kitchen (corn arepas)
  'Arepas Latin Cuisine',          -- corn arepas
  'Joyride Pizza, Mission',        -- gluten-free crust available
  'Joyride Pizza, Union St',       -- gluten-free crust available
  'Joyride Pizza, Market St',      -- gluten-free crust available
  'Greens Restaurant',             -- GF menu key (gf / gfp)
  'Wildseed',                      -- plant-based with GF items labeled
  'Udupi Palace',                  -- South Indian dosa/idli (rice + lentil)
  'Diwali Indian Cuisine',         -- many naturally GF rice/lentil dishes
  'Golden Era',                    -- Vietnamese veg, rice-based
  'Nopalito',                      -- regional Mexican, corn tortillas
  'La Mar Cocina Peruana',         -- Peruvian ceviche
  'Mochica',                       -- Peruvian ceviche
  'Garden Creamery',               -- ice cream
  'Koolfi Creamery'                -- kulfi / ice cream
);

-- Add Purple Rice (Lower Haight) — Korean build-your-own bowls (bibimbap,
-- tofu stew) with a labeled gluten-free menu. New place, not in the import.
insert into places (
  name, category, place_type, cuisine, neighborhood,
  dietary_options, gluten_free, notes, latitude, longitude, price_level
) values (
  'Purple Rice', 'explore', 'restaurant', 'Korean', 'Lower Haight',
  'Both', true,
  'Build-your-own bibimbap-style bowls and tofu stew; gluten-free and vegan items labeled on the menu.',
  37.7719, -122.4308, '$$'
)
on conflict (name) do update set
  gluten_free = excluded.gluten_free,
  dietary_options = excluded.dietary_options,
  notes = excluded.notes;
