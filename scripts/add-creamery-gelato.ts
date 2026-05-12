/**
 * Adds Philmore Creamery and Lush Gelato to the places table.
 *
 * Usage:
 *   npx tsx scripts/add-creamery-gelato.ts
 *
 * Requires .env with NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.
 */

import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const places = [
  {
    name: "Philmore Creamery",
    category: "explore",
    place_type: "restaurant",
    cuisine: "Gelato",
    neighborhood: "Fillmore",
    dietary_options: null,
    notes: null,
    tags: [] as string[],
    latitude: 37.7865213,
    longitude: -122.4332449,
    website: "https://philmorecreamery.com",
    price_level: null,
    google_place_id: null,
  },
  {
    name: "Lush Gelato",
    category: "explore",
    place_type: "restaurant",
    cuisine: "Gelato",
    neighborhood: "North Beach",
    dietary_options: null,
    notes: null,
    tags: [] as string[],
    latitude: 37.7998618,
    longitude: -122.4093193,
    website: "https://www.lushgelato.com",
    price_level: null,
    google_place_id: null,
  },
];

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local");
    process.exit(1);
  }

  const supabase = createClient(url, key);

  const { data, error } = await supabase
    .from("places")
    .upsert(places, { onConflict: "name" })
    .select("id, name");

  if (error) {
    console.error("Error:", error.message);
    process.exit(1);
  }

  console.log("Done:", data?.map((p) => p.name).join(", "));
}

main();
