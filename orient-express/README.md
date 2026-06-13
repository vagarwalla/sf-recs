# Orient Express — Clue Lookup

Fast clue lookup for the board game **Murder on the Orient Express** (Just Games).
Pick your case → pick what happened (question a suspect / crew, search an area,
send a telegram) → pick who or where → get the clue number and full clue text
instantly. No more flipping between the clue-numbers sheet and the booklet.

Built from [`vagarwalla/scaffold`](https://github.com/vagarwalla/scaffold):
Next.js 16 + TypeScript + Tailwind v4 + dark/light mode. **No backend** — clue
data is static, so it loads instantly and works offline.

## Quick start

```bash
npm install
npm run dev      # http://localhost:3000
```

## Pages

- `/` — the 3-tap lookup
- `/verify` — coverage + the full grid and clue list for cross-checking against
  the physical game

## Data

All clue data lives in two files, transcribed from photos of the game:

- `src/lib/grid.ts` — clue-numbers sheet (`action → target → clue # per case`)
- `src/lib/clues.ts` — the booklet (clue text 1–320)

Every entry is `verified: false` until confirmed against the printed components.
See the transcription status section in `CLAUDE.md`.

## Deploy

```bash
vercel --prod
vercel domains add orient.vaidehiagarwalla.com
```

Then add a CNAME in Namecheap: `orient` → `cname.vercel-dns.com.`
