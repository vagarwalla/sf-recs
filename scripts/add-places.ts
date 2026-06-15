#!/usr/bin/env tsx
/**
 * Add (or upsert) a fixed set of places into the Supabase `places` table.
 *
 * Use this for quick, reviewed additions to the wishlist/recs without going
 * through the /admin UI. Upserts on `name` (same conflict key as import.ts),
 * so re-running is safe and idempotent.
 *
 * Usage:
 *   npm run add-places          # upserts the PLACES list below
 *
 * Requires .env with NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.
 */

import { createClient } from "@supabase/supabase-js";

type SeedPlace = {
  name: string;
  category: "rec" | "explore";
  place_type: "restaurant" | "bar" | "coffee" | "activity";
  cuisine: string;
  neighborhood: string;
  dietary_options: "Vegan" | "Veg" | "Both";
  gluten_free?: boolean;
  notes: string;
  latitude: number;
  longitude: number;
  website?: string;
  price_level: string;
};

// Added 2026-06-15. Coordinates verified via Apple Maps / Yelp listings.
const PLACES: SeedPlace[] = [
  {
    name: "Hila Gelato Caffè",
    category: "explore",
    place_type: "restaurant",
    cuisine: "Dessert / Gelato",
    neighborhood: "Mission",
    dietary_options: "Veg",
    gluten_free: true,
    notes: "Healthy-leaning Sicilian-style gelato — natural flavors, not too sweet, gluten-free options.",
    latitude: 37.757721,
    longitude: -122.420898,
    website: "https://www.hilagelato.com/",
    price_level: "$$",
  },
  {
    name: "Lush Gelato",
    category: "explore",
    place_type: "restaurant",
    cuisine: "Dessert / Gelato",
    neighborhood: "North Beach",
    dietary_options: "Veg",
    notes: "Small-batch gelato with unique, high-quality-ingredient flavors. (Multiple SF locations.)",
    latitude: 37.7998618,
    longitude: -122.4093193,
    website: "https://www.lushgelato.com/",
    price_level: "$$",
  },
  {
    name: "Beit Rima",
    category: "explore",
    place_type: "restaurant",
    cuisine: "Levantine / Mediterranean",
    neighborhood: "Duboce / Mission",
    dietary_options: "Both",
    notes: "Arabic comfort food, veg-forward. (Also Cole Valley location.)",
    latitude: 37.7687046,
    longitude: -122.4293266,
    website: "https://beitrimasf.com/",
    price_level: "$$",
  },
];

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    console.error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env",
    );
    process.exit(1);
  }

  const supabase = createClient(url, key);

  const rows = PLACES.map((p) => ({ tags: [] as string[], gluten_free: false, ...p }));

  const { data, error } = await supabase
    .from("places")
    .upsert(rows, { onConflict: "name" })
    .select("id, name, category");

  if (error) {
    console.error("Add failed:", error.message);
    process.exit(1);
  }

  for (const row of data as { name: string; category: string }[]) {
    console.log(`✓ ${row.name} → ${row.category}`);
  }
  console.log(`Upserted ${data.length} place(s).`);
}

main();
