# Handoff — Bakery icon for 13 & Confections

**Branch:** `claude/focused-curie-p0ma5x`
**Date:** 2026-06-14
**Goal:** Bakeries (e.g. **13**, **Confections**) should show a bakery icon (🥐) on the
map instead of a dessert (🍰) or generic (🍽️) icon.

## Background — how the icon is decided

Map marker icons are **not** driven by `place_type`. They come from each place's
**`cuisine`** string, via `getCuisineIcon()` in `src/components/Map.tsx`, which
substring-matches `cuisine` against the `CUISINE_ICONS` map. There is no `bakery`
`place_type` (only `restaurant | bar | coffee | activity`).

So making a place show the bakery icon requires its `cuisine` value to contain
"bakery" / "pastry" / "patisserie" / "boulangerie".

## ✅ Done (code, committed + pushed on this branch)

- `src/components/Map.tsx` — added bakery entries to `CUISINE_ICONS` (🥐), placed
  **before** `dessert` so a bakery never falls back to 🍰 or 🍽️.
- `scripts/retag-cuisine.ts` + `npm run retag` — sets the `cuisine` field on rows by
  name (case-insensitive substring / ILIKE). Defaults to retagging `13` and
  `Confections` as `Bakery`.
- `CHANGELOG.md` updated.
- Verified with `tsc --noEmit` (clean).

## ⛔ NOT done — needs database credentials

The actual rows for **13** and **Confections** in Supabase are **not yet retagged**.
This was blocked because the cloud session had no Supabase credentials (they live in
the user's macOS Keychain / a local `.env`, unreachable from the cloud container).

Until the rows are retagged, the new icon code is live but those places keep whatever
icon their current `cuisine` produces.

## ▶️ Remaining steps (run locally where the creds are)

1. Get on this branch with deps installed:
   ```bash
   git checkout claude/focused-curie-p0ma5x
   git pull origin claude/focused-curie-p0ma5x
   npm install
   ```
2. Ensure `.env` (repo root) has:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://<project>.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=<service-role-key>     # Supabase → Settings → API
   ```
   On Windows the macOS Keychain doesn't exist, so a `.env` file is required.
3. Run the retag:
   ```bash
   npm run retag
   # single place override: npm run retag -- "Confections" "Bakery"
   ```
   Expect output like `✓ Confections → cuisine="Bakery"`.

## ⚠️ Verify before trusting the result

- The script matches by **substring** (`ILIKE %name%`). `"Confections"` is safe, but
  **`"13"` is a loose match** — confirm it didn't also catch some other place whose
  name contains "13". The script prints every row it changed; check that list.
- If `13`'s full name is something more specific, prefer:
  `npm run retag -- "<fuller name>" "Bakery"` and edit the default in
  `scripts/retag-cuisine.ts`.

## Open question for the user

- Icon choice: currently 🥐 (croissant), kept distinct from dessert 🍰. Swap to 🥖 or
  🧁 if preferred — just change the values in `CUISINE_ICONS` in `src/components/Map.tsx`.
