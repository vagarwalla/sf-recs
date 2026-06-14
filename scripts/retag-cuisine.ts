#!/usr/bin/env tsx
/**
 * Retag the `cuisine` field for one or more places by name.
 *
 * The map marker icon is derived from a place's `cuisine` string
 * (see getCuisineIcon in src/components/Map.tsx). Setting a bakery's
 * cuisine to "Bakery" makes it render the 🥐 bakery icon instead of the
 * 🍰 dessert icon or the generic 🍽️ fallback.
 *
 * Usage:
 *   npx tsx scripts/retag-cuisine.ts "Tartine Bakery" Bakery
 *   npx tsx scripts/retag-cuisine.ts "Kahnfections" Bakery
 *   # or run the built-in bakery defaults below with no args:
 *   npx tsx scripts/retag-cuisine.ts
 *
 * Matching is case-insensitive and substring-based (ILIKE %name%), so
 * partial names work. Requires .env with NEXT_PUBLIC_SUPABASE_URL and
 * SUPABASE_SERVICE_ROLE_KEY.
 */

import { createClient } from "@supabase/supabase-js";

// [name, cuisine] pairs applied when the script is run with no arguments.
const DEFAULTS: [string, string][] = [
  ["Tartine Bakery", "Bakery"],
  ["Tartine Manufactory", "Bakery"],
  ["Kahnfections", "Bakery"],
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

  const [argName, argCuisine] = process.argv.slice(2);
  if (argName && !argCuisine) {
    console.error('Usage: npx tsx scripts/retag-cuisine.ts "<name>" "<cuisine>"');
    process.exit(1);
  }

  const targets: [string, string][] =
    argName && argCuisine ? [[argName, argCuisine]] : DEFAULTS;

  for (const [name, cuisine] of targets) {
    const { data, error } = await supabase
      .from("places")
      .update({ cuisine })
      .ilike("name", `%${name}%`)
      .select("id, name, cuisine");

    if (error) {
      console.error(`✗ ${name}: ${error.message}`);
      continue;
    }
    if (!data || data.length === 0) {
      console.warn(`! No place matched "${name}"`);
      continue;
    }
    for (const row of data as { name: string; cuisine: string }[]) {
      console.log(`✓ ${row.name} → cuisine="${row.cuisine}"`);
    }
  }
}

main();
