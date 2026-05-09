# Changelog

All notable changes to **sf-recs** are documented here.

Format: [Keep a Changelog](https://keepachangelog.com/). Categories: Added, Changed, Fixed, Removed.

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
