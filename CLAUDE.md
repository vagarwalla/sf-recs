# sf-recs

Personal recommendations map — restaurants, bars, coffee, activities, and more in SF. Public site at `recs.vaidehiagarwalla.com`.

> **Read SPEC.md before making any change.** If a change contradicts an acceptance criterion, stop and flag it.

## Overview

Two-view app: an interactive Mapbox map + a filterable list of places. Each place is either a **rec** (public recommendation) or **explore** (personal wishlist, not shown publicly by default). Metadata (hours, price, rating, address) is pulled from Google Places API and cached in Supabase — the public page never hits Google directly.

Admin page at `/admin` for adding/removing places via Google Places search, editing notes, and managing categories.

## Tech Stack

| Layer | Choice | Why |
|---|---|---|
| Framework | Next.js 16 (App Router) | Server components for public pages, API routes for admin + Google proxy |
| Map | Mapbox GL JS via `react-map-gl` | Dark mode style swap, vector tiles, clustering, generous free tier |
| Database | Supabase (Postgres) | Stores places list + cached Google metadata. RLS for public read / admin write |
| Live metadata | Google Places API (New) | Fetched daily via Vercel Cron, cached in Supabase |
| Styling | Tailwind v4 | Utility-first CSS |
| Dark/light mode | next-themes | `[data-theme]` + CSS custom properties |
| Hosting | Vercel | Hobby tier, `recs.vaidehiagarwalla.com` via CNAME |
| GitHub | `vaidehiagarwalla/sf-recs` | Personal account, not theorem-labs |

## Project Structure

```
sf-recs/
  src/
    app/
      page.tsx                    # Public map + list view
      layout.tsx                  # Root layout, ThemeProvider, metadata
      globals.css                 # Tailwind + CSS custom properties
      admin/
        page.tsx                  # Admin: search, add, edit notes, remove
      api/
        places/
          route.ts                # GET all places (public) | POST add (admin)
          [id]/route.ts           # PATCH update | DELETE remove (admin)
          refresh/route.ts        # POST: refresh Google metadata (Vercel Cron)
          search/route.ts         # GET: proxy Google Places Text Search (admin)
    components/
      Map.tsx                     # Mapbox GL with markers, popups, clustering
      PlaceCard.tsx               # Detail card (name, hours, rating, notes, links)
      PlaceList.tsx               # Filterable sidebar/bottom-sheet list
      BottomSheet.tsx             # Mobile draggable bottom sheet (peek/half/full)
      CategoryFilter.tsx          # rec / explore / all toggle
      TypeFilter.tsx              # restaurant / bar / coffee / all
      ThemeToggle.tsx             # Light/dark mode toggle
      AdminSearch.tsx             # Google Places autocomplete + add button
      AdminPlaceRow.tsx           # Editable row in admin table
      Providers.tsx               # ThemeProvider wrapper
    lib/
      supabase.ts                 # Supabase client singleton
      google-places.ts            # Google Places API wrapper (search, details, photo URL)
      types.ts                    # TypeScript types
  scripts/
    import.ts                     # One-time Excel -> Supabase import
    seed-metadata.ts              # Bulk fetch Google metadata after import
  CLAUDE.md                       # This file
  SPEC.md                         # Frozen requirements + acceptance criteria
  CHANGELOG.md                    # Change log
  vercel.json                     # Cron config + domain alias
  .env.example                    # Env var template
```

## Conventions & Patterns

- **Server components by default.** Only use `'use client'` when the component needs browser APIs (map, theme toggle, bottom sheet gestures).
- **API routes** handle all Supabase writes and Google API calls. Never call Supabase or Google from client components directly.
- **Mobile-first.** Design for 375px first, then scale up. The map + bottom sheet is the primary mobile experience.
- **No sidebar on mobile.** Desktop gets a split view (35% list / 65% map). Mobile gets full-screen map + draggable bottom sheet.
- **Touch targets:** minimum 44px.
- **CSS custom properties** for theming (`--bg`, `--text`, `--card`, etc.) with `[data-theme="light"]` overrides.
- **Mapbox styles:** `mapbox://styles/mapbox/dark-v11` and `light-v11`, swapped on theme change.
- **Google Places caching:** metadata is fetched daily via Vercel Cron and stored in `cached_metadata`. The public page reads only from Supabase.
- **Admin auth:** cookie-based, checked against `ADMIN_PASSWORD` env var. No OAuth, no user management.
- **No theorem.dev resources.** This is a personal project — personal Google Cloud, personal Supabase, personal GitHub.

## How to Run

```bash
npm install
cp .env.example .env        # fill in values
npm run dev                  # http://localhost:3000
```

## How to Deploy

Deployed on Vercel. Push to `main` triggers auto-deploy.

```bash
vercel --prod
```

Domain: `recs.vaidehiagarwalla.com` — CNAME in Namecheap pointing `recs` to `cname.vercel-dns.com`.

## Credentials & Env Vars

All secrets stored in macOS Keychain under account `vaidehiagarwalla`.

| Var | Keychain key | Notes |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | `supabase-url` | |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `supabase-anon-key` | Public read access |
| `SUPABASE_SERVICE_ROLE_KEY` | `supabase-service-role-key` | Admin writes |
| `NEXT_PUBLIC_MAPBOX_TOKEN` | `mapbox-access-token` | Public — used in client-side map |
| `GOOGLE_PLACES_API_KEY` | `google-places-api-key` | Server-side only — never expose to client |
| `ADMIN_PASSWORD` | `recs-admin-password` | Cookie auth for /admin |
| `CRON_SECRET` | (auto-generated) | Vercel Cron auth for /api/places/refresh |

## Database Schema

```sql
create table places (
  id uuid primary key default gen_random_uuid(),
  google_place_id text unique,
  name text not null unique,
  category text not null check (category in ('rec', 'explore')),
  place_type text not null default 'restaurant',
  cuisine text,
  neighborhood text,
  dietary_options text,        -- 'Vegan', 'Veg', or 'Both'
  notes text,
  tags text[] default '{}',
  latitude double precision not null,
  longitude double precision not null,
  website text,
  price_level text,            -- '$', '$$', '$$$', '$$$$'
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table cached_metadata (
  google_place_id text primary key,
  data jsonb not null,
  fetched_at timestamptz not null default now()
);
```

**Data imported:** 62 restaurants (33 recs, 29 explore) from the Excel spreadsheet on 2026-05-09. The Excel uses "Exploit" for recs — the import script maps this to "rec".

RLS: public SELECT on both tables, service-role-only INSERT/UPDATE/DELETE.

## Changelog

> See CHANGELOG.md for the full log.

## Known Issues / Open Items

1. **Google Places API key** — need to create a personal Google Cloud project and enable Places API (New). Not theorem.dev.
2. **Mapbox token** — need a Mapbox account and access token.
3. **Excel import** — blocked on the user providing the restaurant spreadsheet.
4. **Supabase service role key** — need to retrieve and store in Keychain.
