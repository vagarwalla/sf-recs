# Orient Express — Clue Lookup — orient.vaidehiagarwalla.com

A fast clue lookup for the board game **Murder on the Orient Express** (Just Games).
Instead of the slow two-step manual lookup (find the clue number on the
"clue-numbers" sheet, then read it from the booklet), you pick a case + what
happened and get the clue text immediately.

## Game mechanic
1. A game uses one of **10 cases**.
2. During play a player either **questions a suspect**, **questions a crew member**,
   **searches an area**, or **sends a telegram about** someone.
3. You look up that entity × case on the clue-numbers sheet → a **clue number (1–320)**.
4. You read that numbered clue from the booklet.

This app collapses steps 3–4 into one tap.

## Architecture
- **Framework**: Next.js 16 (App Router) + TypeScript + Tailwind CSS v4
- **Backend**: none — all data is static and baked in (works offline)
- **Hosting**: Vercel, domain `orient.vaidehiagarwalla.com`
- **Theme**: light/dark via `next-themes` (`data-theme`), brass-on-midnight Art Deco palette
- **Fonts**: Space Grotesk (UI), Cinzel Decorative (display), Special Elite (clue text)

## Data (the important part)
- `src/lib/grid.ts` — the clue-numbers sheet: `action → target → clue number per case`.
- `src/lib/clues.ts` — the booklet: clue text for 1–320.
- Transcribed from photos of the physical components. **Every entry starts
  `verified: false`** and must be confirmed against the printed game.
- `/verify` is the QA surface: coverage stats, the full grid, and the full
  clue list with verified/unverified/not-transcribed status.

### Transcription status
- Grid: Cases **1–2** transcribed (pending verify). Cases 3–10 await a clearer
  scan — the right-hand columns of the photo are not legible.
- Booklet: only clearly-legible clues transcribed so far; the rest render as
  "not transcribed" until added.

## File structure
- `src/app/page.tsx` — the 3-step lookup UI
- `src/app/verify/page.tsx` — verification / coverage view
- `src/components/` — CaseSelector, ActionTabs, TargetList, ClueCard, Banner, ThemeToggle
- `src/lib/` — `types.ts`, `grid.ts`, `clues.ts`

## Definition of Done
- `npm run build` exits 0
- `npm run lint` passes clean
- `/` and `/verify` render in the Vercel preview (or local `npm run dev`)
- Data changes are reflected on `/verify` with correct coverage counts

## Infra
Generated from [`vagarwalla/scaffold`](https://github.com/vagarwalla/scaffold).
Record infra-level changes (new subdomain, deploy quirks) in
[`vagarwalla/infra`](https://github.com/vagarwalla/infra).
