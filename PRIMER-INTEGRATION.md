# Putting sf-recs and primer under one roof

> Question: should sf-recs be migrated into the `vagarwalla/primer` repo so
> everything lives in one home with one navigation?
>
> Short answer: **no migration.** Keep the two apps, join them with one shared
> nav. Move to one domain later if the two-domain split still bothers you.

## What the two sides actually are

| | primer | sf-recs |
|---|---|---|
| Framework | Astro 7, fully static | Next.js 16, App Router |
| Runtime needs | none — HTML in an image | Supabase writes, Google Places proxy, cookie auth, daily cron |
| Host | Fly.io, Caddy serving `/srv`, scales to zero | Vercel |
| Domain | `primer.vaidehiagarwalla.com` | `recs.vaidehiagarwalla.com` |
| Look | art-directed, per-post themes, `--primer-*` tokens | Tailwind v4, `--badge-*` / `--pill-*` tokens |
| Deploy | merge to `main` → GitHub Action → `flyctl deploy` | push to `main` → Vercel |

The blocker for a true merge is the runtime column. primer's whole deploy story
is "bake the HTML into an image and let Caddy serve it"; sf-recs cannot be baked
— it needs a server on every request for `/api/*`, and a scheduler for the
nightly Google refresh.

## The three options

### A. Shared nav, two apps *(recommended — a couple of hours)*

Both sites keep their stack and their domain. They stop *feeling* like two
sites because they share one nav and one wordmark.

- **primer side:** add nav links to `src/components/Masthead.astro` (the chrome
  every theme already shares, so one edit covers the blog, `/map` and any future
  page): `writing` → `/`, `tv` → `/map`, `sf recs` → `https://recs.vaidehiagarwalla.com/`.
- **sf-recs side:** the reciprocal link is already in — "part of primer ↗" under
  the sidebar title in `src/components/MapView.tsx`. Grow it into the same set of
  links once primer's nav exists.
- **Optional polish:** port primer's tape wordmark into the recs header so the
  two share a mark. Nothing else about the recs design has to change.

Reversible, no deploy changes, no risk to either site.

### B. One domain, still two apps *(half a day)*

Everything under `primer.vaidehiagarwalla.com`, recs at `/recs`.

- `next.config.ts`: `basePath: '/recs'`, `assetPrefix: '/recs'`.
- primer's `Caddyfile`: `handle_path /recs/* { reverse_proxy <vercel-url> { header_up Host {upstream_hostport} } }`
  above the `try_files` block.
- Keep `recs.vaidehiagarwalla.com` alive and 308 it to `/recs/` so old links live.

Cost: every recs request goes browser → Fly (cold-startable, `min_machines_running = 0`)
→ Vercel, so first paint gets slower, and Fly is now a single point of failure for
the recs app. It also reverses a `SPEC.md` design decision ("Subdomain over
basePath — independent deploy, no root-site coordination"). Not an acceptance
criterion, so it is your call, but it should be a deliberate one.

### C. Migrate sf-recs into the primer repo *(days, not recommended)*

Astro can host the map as an island and can do SSR with the Node adapter, so it
is *possible*. What it costs:

- Rewrite `MapView` / `Map` / `PlaceCard` etc. as an Astro island (React island
  is supported, so the components largely survive; the routing and layout do not).
- Six `/api/*` routes become Astro endpoints, which means primer stops being a
  static site: the Dockerfile grows a Node process, Caddy becomes a proxy in front
  of it, and the machine can no longer scale to zero without a cold start on the blog.
- Vercel Cron has no equivalent — the nightly Google refresh becomes a GitHub
  Action hitting `/api/places/refresh` with `CRON_SECRET`.
- Every recs secret moves into Fly secrets; the blog's deploy can now break the
  recs app and vice versa.

That is a large, one-way change bought for the same user-visible result as B.

## Recommendation

1. Do **A** now — it is the whole "one home, simple navigation" feeling for a
   couple of hours of work and no infrastructure change.
2. Live with it. If two domains still reads as two sites in a month, do **B**;
   it is additive and A's nav survives it unchanged.
3. Only consider **C** if primer ever needs a server anyway for its own reasons.
