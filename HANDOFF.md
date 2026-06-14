# Handoff — Bakery icon retag ✅ COMPLETE

**Completed:** 2026-06-14 (branch `claude/nifty-allen-pmt2sw`)
**Goal:** Bakeries should show the bakery icon (🥐) on the map instead of 🍰/🍽️.

## Outcome

Run locally with Supabase creds present in `.env`. The original target names in the
handoff (`13`, `Confections`) **did not exist** in the database, so the retag scope
was corrected to the actual bakeries (all previously `cuisine="Dessert"`):

- ✅ **Tartine Bakery – Guerrero (flagship)** → `cuisine="Bakery"`
- ✅ **Tartine Manufactory** → `cuisine="Bakery"`
- ✅ **Kahnfections** → `cuisine="Bakery"` (this was the real "Confections")
- ⏭️ **"13"** — skipped; no such place exists (never added or renamed).

Verified: exactly 3 rows now match `cuisine ILIKE '%bakery%'`; no over-matching.

`scripts/retag-cuisine.ts` defaults were updated to the three correct names so a
future no-arg `npm run retag` is a safe re-apply.

## Background — how the icon is decided (unchanged)

Map marker icons come from each place's **`cuisine`** string via `getCuisineIcon()`
in `src/components/Map.tsx`, substring-matching against `CUISINE_ICONS`. The `bakery`
(🥐) entries sit **before** `dessert` (🍰), so a bakery never falls back to 🍰/🍽️.
There is no `bakery` `place_type` — only `restaurant | bar | coffee | activity`.

## Optional follow-up

- Icon choice is 🥐 (croissant). Swap to 🥖/🧁 by editing `CUISINE_ICONS` values in
  `src/components/Map.tsx` if preferred.
