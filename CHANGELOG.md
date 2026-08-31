# Changelog

All notable changes to **sf-recs** are documented here.

Format: [Keep a Changelog](https://keepachangelog.com/). Categories: Added, Changed, Fixed, Removed.

---

## [2026-08-31] - Attraction icons

### Added
- **Food / Attractions filter.** A three-way pill selector (All · Food ·
  Attractions) in the filter menu, on both the desktop sidebar and the mobile
  floating filters. Pills rather than a dropdown because it is the coarsest cut
  of the map and worth a single tap. Reuses the existing `FilterPills`
  component, which until now was unused. `activity` is the only non-food place
  type, so the split is that one value against the other three.
- **Attraction marker icons.** Activities now draw from their own icon table
  (`ATTRACTION_ICONS` in `Map.tsx`) instead of the cuisine one — zoo 🦁, science
  museum 🔬, arcade 🕹️, park 🌳, and so on, falling back to 🎟️ rather than a
  dinner plate. The lookup reads the same free-text `cuisine` column, which for
  an activity holds the kind of attraction.
- `ATTRACTION_BY_TYPE` in `derive-place.ts` — Google `types` → attraction label
  (museum, zoo, aquarium, arcade, park, landmark, …), consulted only when the
  derived `place_type` is `activity`, so a restaurant Google also tags
  `tourist_attraction` is still labelled by its food.
- Seeded `scripts/add-places.ts` with the first three attractions: Exploratorium,
  San Francisco Zoo & Gardens, Musée Mécanique. `dietary_options` and
  `price_level` are now optional on `SeedPlace` — attractions have neither.
- **`scripts/add-places.ts` now links to Google.** Each seeded place is matched
  against Places Text Search and gets its `google_place_id` plus a
  `cached_metadata` row, so it shows hours, rating and photos immediately and is
  picked up by the daily refresh cron. Previously the script wrote rows with a
  null `google_place_id`, which the cron skips forever.
- **`--backfill`** repairs existing rows the same way: places with no
  `google_place_id` are matched by name + coordinates, and places that are
  linked but have no `cached_metadata` row get fetched. `--backfill-only` skips
  the seed list; `--dry-run` resolves and reports without writing.
- `searchPlaces()` now returns `location` (added to the Text Search field mask,
  same billing tier), which is what lets the matcher verify a candidate without
  a Details call each.

### Changed
- `getCuisineIcon(cuisine)` → `getPlaceIcon(place)`, which picks the icon table
  from `place_type`.

### Fixed
- `npm run add-places` and `npm run retag` never loaded `.env` — `tsx` does not
  read it on its own — so both always died on "Missing NEXT_PUBLIC_SUPABASE_URL".
  Both now pass `--env-file-if-exists=.env`.

### Matching
- A Google result is accepted only when the name agrees (accent- and
  punctuation-insensitive containment either way, so "San Francisco Zoo &
  Gardens" matches "San Francisco Zoo") **and** it sits within 500m of the
  coordinates already on file. Anything less certain is left unlinked and
  reported — a wrong `google_place_id` is far worse than a missing one.

---

## [2026-08-31] - Remove the `/admin` add form

### Removed
- The add-place form in `/admin` (`addMode`/`newPlace` state, `handleAdd`, the toggle button and its form JSX). It required hand-typing latitude and longitude and never set `google_place_id`, so places added through it never got cached metadata. `/add` supersedes it.
- The "Add Place" button is now a link to `/add`. Everything else in `/admin` — the table, inline editing, delete, refresh, search — is unchanged.

> Landed separately from the `/add` commit so this one can be reverted on its own if `/add` misbehaves in production.

---

## [2026-08-31] - Quick-add page at `/add`

### Added
- **`/add`** — add a place from the site instead of hand-typing coordinates in `/admin`. Search Google Places, tap the result, and everything derivable is pre-filled; correct anything wrong and press Enter. Password comes first (reuses the existing 30-day `sf-recs-admin` cookie, so usually never asked). On success it confirms, resets and refocuses the search box for the next place. No moderation queue — the password is the only gate.
- `GET /api/places/details?placeId=` — auth'd proxy for Google Place Details.
- `src/lib/derive-place.ts` — Google `types` → `place_type` and `cuisine`, `priceLevel` → `$`…`$$$$`, plus haversine nearest-place neighborhood inference and frequency-sorted distinct values.
- `src/components/StarInput.tsx` — the owner's 1-5 star input, extracted from `/admin` so both pages share it.
- **Add** button in the map's floating control cluster, linking to `/add`.

### Changed
- `DETAIL_FIELDS` in `google-places.ts` now also requests `primaryType`, `primaryTypeDisplayName`, `types`, `shortFormattedAddress` and `addressComponents`; those fields were added to `GooglePlaceDetails`.
- `POST /api/places` now fetches Google details server-side and upserts `cached_metadata` immediately after a successful insert, so a new place renders with hours/rating/photos without waiting for the daily cron. A Google failure is logged and does not fail the insert.
- `/add` sets `google_place_id` on every place (the old `/admin` add form never did, so those places never got cached metadata) and defaults `category` to `rec` rather than `explore`.
- Mobile filter row moved below the map's control cluster (`top-16`, full width) so the wider Add button can't overlap it at 375px — the filters also get more room than before.

---

## [2026-06-14] - Bakery cuisine retag (completes Bakery icon work)

### Changed
- Retagged the three actual bakeries from `cuisine="Dessert"` to `cuisine="Bakery"` so they render the 🥐 icon: **Tartine Bakery – Guerrero (flagship)**, **Tartine Manufactory**, **Kahnfections**.
- `scripts/retag-cuisine.ts` defaults updated to those three names — the prior defaults ("13", "Confections") never existed in the database.

### Note
- The earlier handoff's targets were stale: "Confections" was really **Kahnfections**, and "13" does not exist as a place (skipped). See `HANDOFF.md`.

---

## [2026-06-14] - Gluten-free dietary option

### Added
- `gluten_free` boolean column on `places` (migration `003_gluten_free.sql`) — an *additive* attribute orthogonal to `dietary_options`, so a place can be Vegan/Veg/Both **and** flag gluten-free options. Bar is "has gluten-free options," not a celiac-safe guarantee.
- "Gluten-free" pill in the Diet filter; when selected it's an AND constraint (intersects with any vegan/vegetarian selection).
- Gluten-free badge ("GF") on public place cards and admin rows; gluten-free checkbox in admin add/edit forms.
- Marked 16 existing places with gluten-free options (research-backed: Oren's Hummus, Pica Pica, all 3 Joyride Pizza, Greens, Wildseed, Udupi Palace, Diwali, Golden Era, Nopalito, La Mar, Mochica, Garden Creamery, Koolfi Creamery, Arepas Latin Cuisine).
- Added **Purple Rice** (Korean, Lower Haight) — labeled gluten-free + vegan menu.
- `import.ts` now reads an optional "Gluten Free" Excel column (forward-compatible; defaults to false).

### Note
- The `data/sf_veg_vegan_restaurants.xlsx` seed was left unchanged; migration `003_gluten_free.sql` is the authoritative source for the gluten-free data and the Purple Rice row.

---

## [2026-06-14] - Bakery icon

### Added
- Bakery map marker icon (🥐) — places with a `cuisine` of "Bakery"/"Pastry"/"Patisserie"/"Boulangerie" now render a distinct bakery icon instead of the 🍰 dessert or generic 🍽️ icon
- `scripts/retag-cuisine.ts` (`npm run retag`) — set the `cuisine` field for places by name; defaults to retagging "13" and "Confections" as Bakery

---

## [2026-05-09] - Visual refresh + new features

### Added
- Warm earthy color palette matching jars.vaidehiagarwalla.com (dark: #0e0d0a/#fff4d6, light: #fff4d6/#1a1714)
- Space Grotesk font replacing Geist
- Cuisine filter (dynamic options extracted from place data)
- Personal rating system (1-5 stars) — admin can rate places, stars display on public cards
- Star rating input component in admin add/edit forms
- Map markers now show restaurant names as labels (visible at zoom > 13)
- "Open now" / "Closed" badge on place cards (from cached Google metadata)
- Today's opening hours displayed on place cards
- Notes displayed in blockquote style with left accent border
- `cached_metadata` joined in GET `/api/places` for enriched public data
- `rating` column in `places` table (migration `002_add_rating.sql`)
- Auto-dismissing status messages in admin (4s timeout)

### Changed
- Badge colors: rec = green (#2ee0c0), explore = violet (#a08aff)
- Accent color from orange to green, with orange and violet as secondary accents
- Pills: rounded-full with bold text, green active state
- Buttons: rounded-full styling matching jars aesthetic
- Dietary options icon: Clock replaced with Leaf
- Mobile floating filters now show both category and dietary pills
- Cuisine line on cards merged with neighborhood (single row with dots)

### Fixed
- Dietary options used Clock icon (semantic mismatch) — now uses Leaf

---

## [2026-05-09] - Vercel deployment

### Added
- `vercel.json` with daily cron job for metadata refresh (8am UTC)
- Vercel project linked and env vars configured (Supabase URL/keys, admin password)
- Production deploy live at `https://sf-recs.vercel.app`
- GET handler on `/api/places/refresh` for Vercel cron compatibility

### Changed
- Cron auth supports both `CRON_SECRET` (Pro plan) and `x-vercel-cron` header (Hobby plan)

---

## [2026-05-09] - Admin page + API routes

### Added
- `/admin` page: password-protected admin interface with login, table view, inline edit, add/delete places, search, refresh metadata button
- `/api/auth` POST: cookie-based login
- `/api/places` GET/POST: list all places (public) / add new place (admin)
- `/api/places/[id]` PATCH/DELETE: update / remove place (admin)
- `/api/places/search` GET: proxy Google Places Text Search (admin)
- `/api/places/refresh` POST: refresh all cached metadata from Google (admin/cron)
- `src/lib/auth.ts`: cookie-based auth helper

---

## [2026-05-09] - Public page UI

### Added
- MapView: desktop split-view (35% sidebar / 65% map) + mobile full-screen map with draggable bottom sheet
- Map component: Mapbox GL with markers, popups, fly-to, dark/light style swap
- PlaceCard: name, category badge, cuisine, price, neighborhood, dietary options, notes, Directions + Website buttons
- PlaceList: search bar + scrollable card list with hover-to-highlight
- FilterPills: category (All/Recs/Explore) and dietary (All/Vegan/Veg/Both) with labels
- BottomSheet: touch-draggable mobile sheet with 3 snap points (peek/half/full)
- ThemeToggle: dark/light with localStorage, no FOUC
- CSS custom properties for full theming (dark default, light override)
- Server component data fetching from Supabase

---

## [2026-05-09] - Data layer + Excel import

### Added
- Supabase schema: `places` table (with cuisine, neighborhood, dietary_options, lat/lng, price_level) + `cached_metadata` table + RLS policies + indexes
- `src/lib/types.ts` — TypeScript types for Place, CachedMetadata, GooglePlaceDetails
- `src/lib/supabase.ts` — Supabase client singleton (public + admin)
- `src/lib/google-places.ts` — Google Places API wrapper (search, details, photo URL)
- `scripts/import.ts` — one-time Excel-to-Supabase import script
- Imported 62 restaurants (33 recs, 29 explore) from Excel spreadsheet
- Stored `supabase-service-role-key` in macOS Keychain

---

## [2026-05-09] - Initial project scaffold

### Added
- Next.js 16 project with TypeScript, Tailwind v4, App Router
- CLAUDE.md with full project instructions, conventions, architecture, and credentials reference
- SPEC.md with frozen user requirements, acceptance criteria (25 items), design decisions, data model, API surface, UI/UX requirements, and edge cases
- CHANGELOG.md (this file)
- .env.example with all required environment variables
- Dependencies: @supabase/supabase-js, mapbox-gl, react-map-gl, next-themes, lucide-react, clsx, tailwind-merge
- .claude/settings.json for Claude Code configuration
