#!/usr/bin/env tsx
/**
 * Add (or upsert) a fixed set of places into the Supabase `places` table, and
 * repair the Google link on places that are missing it.
 *
 * Every place written here is matched against Google Places so it gets a
 * `google_place_id` and a `cached_metadata` row. Without those it renders with
 * no hours, rating or photos, and the daily refresh cron skips it entirely.
 *
 * Usage:
 *   npm run add-places                    # upsert the PLACES list below
 *   npm run add-places -- --backfill      # ...and repair every existing place
 *   npm run add-places -- --backfill-only # repair only, skip the PLACES list
 *   npm run add-places -- --dry-run       # resolve and report, write nothing
 *
 * Backfill covers two gaps: a place with no `google_place_id` at all (matched
 * by name + coordinates), and a linked place with no `cached_metadata` row
 * (fetched directly, no matching needed).
 *
 * Upserts on `name` (same conflict key as import.ts), so re-running is safe and
 * idempotent. Requires .env with NEXT_PUBLIC_SUPABASE_URL,
 * SUPABASE_SERVICE_ROLE_KEY and GOOGLE_PLACES_API_KEY.
 */

import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { getPlaceDetails, searchPlaces } from "../src/lib/google-places";
import { haversineKm } from "../src/lib/derive-place";
import type { GooglePlaceDetails } from "../src/lib/types";

type SeedPlace = {
  name: string;
  category: "rec" | "explore";
  place_type: "restaurant" | "bar" | "coffee" | "activity";
  cuisine: string;
  neighborhood: string;
  dietary_options?: "Vegan" | "Veg" | "Both";
  gluten_free?: boolean;
  notes: string;
  latitude: number;
  longitude: number;
  website?: string;
  price_level?: string;
};

// Added 2026-08-31. Attractions — coordinates verified against the venues' own
// visitor pages. `cuisine` holds the attraction kind for activities, which is
// what drives the marker icon.
const PLACES: SeedPlace[] = [
  {
    name: "Exploratorium",
    category: "rec",
    place_type: "activity",
    cuisine: "Science Museum",
    neighborhood: "Embarcadero",
    notes: "Hands-on science and perception museum on Pier 15. After Dark is 18+ on Thursday evenings.",
    latitude: 37.801434,
    longitude: -122.397285,
    website: "https://www.exploratorium.edu/",
  },
  {
    name: "San Francisco Zoo & Gardens",
    category: "rec",
    place_type: "activity",
    cuisine: "Zoo",
    neighborhood: "Outer Sunset",
    notes: "100 acres at the ocean end of Sloat — gardens as much as animals. Bring a jacket, it is always foggy out there.",
    latitude: 37.732500,
    longitude: -122.502900,
    website: "https://www.sfzoo.org/",
  },
  {
    name: "Musée Mécanique",
    category: "rec",
    place_type: "activity",
    cuisine: "Arcade",
    neighborhood: "Fisherman's Wharf",
    notes: "Free to enter, coin-op antique arcade machines at Pier 45. Bring quarters.",
    latitude: 37.809900,
    longitude: -122.416100,
    website: "https://www.museemecanique.com/",
  },
];

const SF_BIAS = { lat: 37.76, lng: -122.44 };

/**
 * How far a Google result may sit from the coordinates we already hold before
 * the match is refused. Tight enough that a neighbouring business on the same
 * block cannot be linked by mistake, loose enough for the usual disagreement
 * between a street address and a pin dropped on a large site like a zoo.
 */
const MATCH_RADIUS_KM = 0.5;

/** Courtesy pause between Google calls so a long backfill does not burst. */
const THROTTLE_MS = 200;

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** Lowercase, strip accents and punctuation: "Musée Mécanique" -> "musee mecanique". */
function normalizeName(name: string): string {
  return name
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

/**
 * A match needs the name to line up as well as the coordinates. Containment
 * either way, so "San Francisco Zoo & Gardens" still matches Google's shorter
 * "San Francisco Zoo".
 */
function namesAgree(a: string, b: string): boolean {
  const x = normalizeName(a);
  const y = normalizeName(b);
  if (!x || !y) return false;
  return x.includes(y) || y.includes(x);
}

type Resolved = { placeId: string; details: GooglePlaceDetails };

/**
 * Find the Google place for a row whose coordinates are already known. Search
 * returns locations, so candidates are filtered on distance and name before
 * spending a Details call. Returns null rather than guessing — an unlinked
 * place is a far smaller problem than a place linked to the wrong business,
 * and --dry-run exists to show what would have linked.
 */
async function resolveGooglePlace(
  name: string,
  coords: { lat: number; lng: number }
): Promise<Resolved | null> {
  const candidates = await searchPlaces(`${name} San Francisco`, SF_BIAS);

  const scored = candidates
    .flatMap((candidate) => {
      const location = candidate.location;
      if (!location) return [];
      if (!namesAgree(name, candidate.displayName?.text ?? "")) return [];
      const km = haversineKm(coords, {
        lat: location.latitude,
        lng: location.longitude,
      });
      return km <= MATCH_RADIUS_KM ? [{ candidate, km }] : [];
    })
    .sort((a, b) => a.km - b.km);

  const best = scored[0];
  if (!best) return null;

  await sleep(THROTTLE_MS);
  const details = await getPlaceDetails(best.candidate.id);
  return { placeId: best.candidate.id, details };
}

async function cacheMetadata(
  supabase: SupabaseClient,
  placeId: string,
  details: GooglePlaceDetails
): Promise<void> {
  const { error } = await supabase.from("cached_metadata").upsert({
    google_place_id: placeId,
    data: details,
    fetched_at: new Date().toISOString(),
  });
  if (error) throw new Error(`cached_metadata upsert failed: ${error.message}`);
}

type Counts = { linked: number; unmatched: number; failed: number };

const emptyCounts = (): Counts => ({ linked: 0, unmatched: 0, failed: 0 });

/** Upsert the PLACES list, resolving each one's Google link along the way. */
async function seed(supabase: SupabaseClient, dryRun: boolean): Promise<Counts> {
  const counts = emptyCounts();
  if (PLACES.length === 0) return counts;

  console.log(`\nSeeding ${PLACES.length} place(s)…`);

  for (const place of PLACES) {
    let resolved: Resolved | null = null;
    let lookupFailed = false;
    try {
      resolved = await resolveGooglePlace(place.name, {
        lat: place.latitude,
        lng: place.longitude,
      });
    } catch (err) {
      // Not fatal: the place is still worth having. A later run, or /add, can
      // link it. Same stance as POST /api/places.
      lookupFailed = true;
      console.warn(
        `  ! ${place.name} — Google lookup failed: ${err instanceof Error ? err.message : err}`
      );
    }

    // Only set google_place_id when there is one. Upserting an explicit null
    // would wipe a link an earlier run (or /add) had already established.
    const row = {
      tags: [] as string[],
      gluten_free: false,
      ...place,
      ...(resolved ? { google_place_id: resolved.placeId } : {}),
    };

    if (dryRun) {
      console.log(
        `  · ${place.name} → ${resolved ? resolved.placeId : "no confident match"} (dry run, not written)`
      );
      if (resolved) counts.linked++;
      else if (lookupFailed) counts.failed++;
      else counts.unmatched++;
      continue;
    }

    const { error } = await supabase
      .from("places")
      .upsert(row, { onConflict: "name" })
      .select("id, name, category")
      .single();

    if (error) {
      console.error(`  ✗ ${place.name} — ${error.message}`);
      counts.failed++;
      continue;
    }

    if (resolved) {
      await cacheMetadata(supabase, resolved.placeId, resolved.details);
      counts.linked++;
      console.log(`  ✓ ${place.name} → ${place.category}, linked + cached`);
    } else {
      if (lookupFailed) counts.failed++;
      else counts.unmatched++;
      console.log(`  ✓ ${place.name} → ${place.category}, saved without a Google link`);
    }

    await sleep(THROTTLE_MS);
  }

  return counts;
}

type PlaceRow = {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  google_place_id: string | null;
};

/**
 * Repair existing rows: link the ones with no `google_place_id`, and cache
 * metadata for linked ones that have no `cached_metadata` row.
 */
async function backfill(
  supabase: SupabaseClient,
  dryRun: boolean
): Promise<Counts> {
  const counts = emptyCounts();

  const { data: places, error } = await supabase
    .from("places")
    .select("id, name, latitude, longitude, google_place_id")
    .order("name");
  if (error) throw new Error(`Could not read places: ${error.message}`);

  const { data: cached, error: cachedError } = await supabase
    .from("cached_metadata")
    .select("google_place_id");
  if (cachedError) {
    throw new Error(`Could not read cached_metadata: ${cachedError.message}`);
  }
  const haveMetadata = new Set(
    (cached ?? []).map((c: { google_place_id: string }) => c.google_place_id)
  );

  const rows = (places ?? []) as PlaceRow[];
  const unlinked = rows.filter((p) => !p.google_place_id);
  const uncached = rows.filter(
    (p) => p.google_place_id && !haveMetadata.has(p.google_place_id)
  );

  console.log(
    `\nBackfill: ${rows.length} place(s) total — ${unlinked.length} unlinked, ${uncached.length} linked but uncached.`
  );

  for (const place of unlinked) {
    let resolved: Resolved | null = null;
    try {
      resolved = await resolveGooglePlace(place.name, {
        lat: place.latitude,
        lng: place.longitude,
      });
    } catch (err) {
      counts.failed++;
      console.warn(
        `  ! ${place.name} — Google lookup failed: ${err instanceof Error ? err.message : err}`
      );
      continue;
    }

    if (!resolved) {
      counts.unmatched++;
      console.log(`  – ${place.name} — no confident match, left unlinked`);
      continue;
    }

    if (dryRun) {
      counts.linked++;
      console.log(`  · ${place.name} → ${resolved.placeId} (dry run, not written)`);
      await sleep(THROTTLE_MS);
      continue;
    }

    const { error: updateError } = await supabase
      .from("places")
      .update({ google_place_id: resolved.placeId })
      .eq("id", place.id);

    if (updateError) {
      // Most likely another row already holds this place id (google_place_id
      // is UNIQUE) — a duplicate worth looking at by hand.
      counts.failed++;
      console.error(`  ✗ ${place.name} — ${updateError.message}`);
      continue;
    }

    await cacheMetadata(supabase, resolved.placeId, resolved.details);
    counts.linked++;
    console.log(`  ✓ ${place.name} — linked + cached`);
    await sleep(THROTTLE_MS);
  }

  for (const place of uncached) {
    const placeId = place.google_place_id as string;

    if (dryRun) {
      console.log(`  · ${place.name} — would cache metadata (dry run)`);
      continue;
    }

    try {
      const details = await getPlaceDetails(placeId);
      await cacheMetadata(supabase, placeId, details);
      console.log(`  ✓ ${place.name} — metadata cached`);
    } catch (err) {
      counts.failed++;
      console.warn(
        `  ! ${place.name} — could not cache metadata: ${err instanceof Error ? err.message : err}`
      );
    }
    await sleep(THROTTLE_MS);
  }

  return counts;
}

async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes("--dry-run");
  const backfillOnly = args.includes("--backfill-only");
  const runBackfill = backfillOnly || args.includes("--backfill");

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    console.error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env",
    );
    process.exit(1);
  }
  if (!process.env.GOOGLE_PLACES_API_KEY) {
    console.error("Missing GOOGLE_PLACES_API_KEY in .env");
    process.exit(1);
  }

  const supabase = createClient(url, key);

  if (dryRun) console.log("Dry run — nothing will be written.");

  const total = emptyCounts();
  const add = (c: Counts) => {
    total.linked += c.linked;
    total.unmatched += c.unmatched;
    total.failed += c.failed;
  };

  if (!backfillOnly) add(await seed(supabase, dryRun));
  if (runBackfill) add(await backfill(supabase, dryRun));

  console.log(
    `\nDone. ${total.linked} linked to Google, ${total.unmatched} left unlinked, ${total.failed} failed.`
  );
  if (total.unmatched > 0) {
    console.log(
      "Unlinked places show no hours, rating or photos and are skipped by the daily refresh — link them through /add or by hand.",
    );
  }
  if (total.failed > 0) process.exit(1);
}

main();
