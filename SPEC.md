# sf-recs — Specification

> This document freezes the user's requirements. It is the regression checklist.
> Any PR that breaks a checked acceptance criterion is a regression.

## Original Request

Create a personal recommendations site at `vaidehiagarwalla.com/recs` (deployed as `recs.vaidehiagarwalla.com`). It has a map with all my recs, starting with restaurants but expanding to other things (bars, coffee, activities). Some entries are "recs" (public recommendations) and some are "explore" (personal list, NOT recs — more for me to easily pick a restaurant). I want all the metadata (hours, locations, etc.) pulling from the most up-to-date source, not hardcoded. I want to be able to quickly add my own notes and add/remove new places with an easy search. Import initial data from an Excel file.

## Acceptance Criteria

### Map & Public View
- [ ] Interactive map showing all places with markers
- [ ] Markers visually distinguish between "rec" and "explore" categories
- [ ] Clicking a marker shows place details: name, rating, hours, address, price level, personal notes
- [ ] "Directions" button that deep-links to Apple Maps / Google Maps
- [ ] "Website" link to the restaurant's website
- [ ] Category filter: show recs only, explore only, or all
- [ ] Type filter: restaurant, bar, coffee, activity, all
- [ ] "Open now" quick filter based on cached opening hours
- [ ] Search/filter bar to find places by name

### Mobile (< 768px) — Critical
- [ ] Full-screen map as the default view
- [ ] Floating filter pills at the top of the map
- [ ] Draggable bottom sheet with 3 snap points: peek (2-3 cards visible), half (scrollable list), full (replaces map)
- [ ] Tapping a marker opens a slide-up detail card
- [ ] All touch targets are at least 44px
- [ ] No sidebar on mobile — everything is map + bottom sheet
- [ ] Map controls: zoom (bottom-right), locate-me, theme toggle (top-right)

### Desktop (>= 768px)
- [ ] Split view: ~35% scrollable list panel on left, ~65% map on right
- [ ] Hover on list item highlights corresponding marker on map
- [ ] Click marker scrolls list to that item and expands detail

### Live Metadata
- [ ] Hours, rating, price level, address, photos pulled from Google Places API
- [ ] Metadata cached in Supabase, NOT fetched on every page load
- [ ] Daily refresh via Vercel Cron
- [ ] Cached data includes `currentOpeningHours` for "open now" filter

### Admin (/admin)
- [ ] Password-protected admin page
- [ ] Search for places via Google Places Text Search
- [ ] Click search result to add a place (saves to Supabase + fetches metadata)
- [ ] Edit personal notes inline for any place
- [ ] Change category (rec/explore) and type (restaurant/bar/etc.)
- [ ] Edit tags
- [ ] Delete a place
- [ ] Manual "refresh metadata" button

### Theme
- [ ] Light/dark mode toggle
- [ ] Preference stored in localStorage
- [ ] No flash of wrong theme on load
- [ ] Map style switches between dark-v11 and light-v11

### Data Import
- [ ] One-time script to import from Excel spreadsheet
- [ ] Script resolves restaurant names to Google Place IDs
- [ ] Script preserves category (rec vs explore) and any notes from the spreadsheet

## Out of Scope

- User accounts / multi-user support (this is a single-person site)
- Reviews or ratings by the site owner (just personal notes)
- Payments / reservations / booking integrations
- SEO optimization beyond basic meta tags
- Analytics / tracking
- Comments or social features
- theorem.dev infrastructure or resources

## Design Decisions

| Decision | Why | Alternatives |
|---|---|---|
| Mapbox GL JS over Google Maps | Better dark mode (style URL swap), generous free tier (50K loads/mo), vector tiles | Google Maps JS API (aggressive pricing, less elegant dark mode) |
| Supabase over JSON-in-repo | Admin interface needs CRUD; JSON breaks down for dynamic data | JSON file (no admin UI), Airtable (overkill) |
| Google Places API (New) over Yelp/Foursquare | Most comprehensive hours + metadata, industry standard | Yelp (limited free tier), Foursquare (less coverage) |
| Daily cron refresh over client-side fetch | Zero API cost per visitor, fast page loads | Client-side (expensive, slow), weekly refresh (too stale) |
| Cookie auth over Supabase Auth | Single user, minimal complexity | Supabase Auth (overkill for one user) |
| Subdomain over basePath | Independent deploy, no root-site coordination, matches existing pattern | basePath `/recs` (asset quirks, root-site dependency) |

## Data Model

### `places` table
| Column | Type | Notes |
|---|---|---|
| id | uuid | Primary key |
| google_place_id | text | Unique, links to cached_metadata |
| name | text | Display name (from Google, editable) |
| category | text | `rec` or `explore` |
| place_type | text | `restaurant`, `bar`, `coffee`, `activity` |
| notes | text | Personal notes (nullable) |
| tags | text[] | Optional tags like "date night", "group" |
| created_at | timestamptz | Auto |
| updated_at | timestamptz | Auto |

### `cached_metadata` table
| Column | Type | Notes |
|---|---|---|
| google_place_id | text | Primary key, FK to places |
| data | jsonb | Full Google Places API response |
| fetched_at | timestamptz | When metadata was last refreshed |

## API Surface

| Method | Path | Auth | Purpose |
|---|---|---|---|
| GET | `/api/places` | Public | List all places with cached metadata |
| POST | `/api/places` | Admin | Add a new place |
| PATCH | `/api/places/[id]` | Admin | Update place (notes, category, tags) |
| DELETE | `/api/places/[id]` | Admin | Remove a place |
| GET | `/api/places/search?q=...` | Admin | Proxy Google Places Text Search |
| POST | `/api/places/refresh` | Cron/Admin | Refresh all cached metadata from Google |

## UI/UX Requirements

### Mobile (< 768px)
- Full-screen map, no chrome except floating pills and controls
- Bottom sheet: peek shows 2-3 place cards; half shows scrollable list; full replaces map
- Smooth drag gestures with momentum
- Place detail card slides up from bottom with: name, rating stars, "Open now" / "Closed" badge, hours, address, notes, Directions + Website buttons

### Desktop (>= 768px)
- Left panel (35%): search bar, filter pills, scrollable place list with cards
- Right area (65%): map filling the remaining space
- List-map interaction: hover highlights, click syncs

### Shared
- Filter pills: compact, horizontally scrollable on mobile
- Place cards: consistent design across list + map popups
- Empty states for no results / no places matching filters

## Edge Cases & Error Handling

- Google Places API returns no results for a search: show "No results found" message in admin
- Google Places API rate limit / error during cron refresh: log the error, skip that place, continue with the rest. Retry failed places on next run.
- Place has no opening hours in Google (some don't): show "Hours not available" instead of blank
- Place has been permanently closed (Google returns `businessStatus: CLOSED_PERMANENTLY`): show a "Permanently closed" badge, flag for admin review
- Duplicate Google Place ID on add: reject with clear error message
- Admin cookie expired: redirect to login page
- Mapbox GL not supported (old browser): show list-only fallback with a notice
- No cached metadata yet (fresh install): show place name only, prompt admin to run a refresh
