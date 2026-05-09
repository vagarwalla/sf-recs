# Changelog

All notable changes to **sf-recs** are documented here.

Format: [Keep a Changelog](https://keepachangelog.com/). Categories: Added, Changed, Fixed, Removed.

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
