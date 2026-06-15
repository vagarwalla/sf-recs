# Taste Profile & Blacklist

> Reference for recommending new places. Derived from the `places` data
> (`data/sf_veg_vegan_restaurants.xlsx` / Supabase `places`) plus stated
> preferences across sessions. Keep this current — when a place is rejected,
> add it to the **Blacklist** with a reason.

## Taste Profile

**Hard constraint**
- **Always vegetarian/vegan-friendly.** Every saved place has veg/vegan options.
  This is non-negotiable — never recommend a place without real veg options.

**Price & vibe**
- Skews **casual to mid-range** (`$`–`$$`; ~26 of 33 recs are `$$`).
- Open to **`$$$`/`$$$$` occasionally** for genuinely top-rated / acclaimed spots
  (e.g. Michelin), but it's the exception, not the default.

**Cuisines loved (from recs)**
- **Dessert is the #1 category** — chocolate (Dandelion), bakeries (Tartine,
  Kahnfections), ice cream/kulfi (Garden Creamery, Koolfi), chai (Elaichi).
- **Pizza & pasta** — Joyride (Detroit-style), Flour + Water, Gusto Pinsa.
- **Dumplings & casual Chinese** — Dumpling Kitchen, Mamahuhu.
- **Globally curious** — Japanese/sushi (Cha-Ya, Shizen), South Indian veg
  (Udupi, Diwali), Mexican (Otra, Al Carajo), ramen (Mensho), Israeli/Levantine
  (Oren's Hummus), Venezuelan arepas (Pica Pica).
- Likes **local mini-chains** (Joyride, Mamahuhu, Dumpling Kitchen, Dandelion).

**Dessert / ice cream nuance (important)**
- Prefers **balanced, NOT overly sweet** ice cream & gelato.
- 👍 Mitchell's, Bi-Rite Creamery, Hila Gelato, Humphry Slocombe (savory-leaning),
  Koolfi (cardamom kulfi), Garden Creamery (Thai tea / black sesame).
- 👎 Candy-sweet shops — see Blacklist.

**Variety & cuisine balance**
- Wants **variety across cuisines** — don't lean too heavily on any one cuisine
  when recommending a set.
- Is Indian but **does not want Indian searched by default**. Suggest it only when
  it's genuinely standout, not as a go-to.
- **Always up to try new/unfamiliar cuisines** *if they're especially highly rated*.

**Ingredient preferences**
- Prefers **less dairy** and **fewer heavy fried foods**. Occasional exceptions are
  fine — treat heavy/fried/dairy-rich as the exception, not the default pick.

**Desserts (refined)**
- Wants **authentic, natural flavors** or genuine experimentation — always
  **not too sweet**, high-quality ingredients.

**Chains & sourcing**
- **Strong dispreference for big chains** (often not as good). BUT defer to
  **Yelp / review consensus** over a blanket anti-chain rule — a well-reviewed
  spot wins regardless.

**Geography**
- Mission-heavy, but spread across SF.

## Blacklist — do NOT recommend

### Disliked (taste mismatch)
| Place | Type | Reason |
|---|---|---|
| Amorino | Gelato chain | Disliked (stated 2026-06-15). |
| Salt & Straw | Ice cream | Too sweet (stated 2026-06-15). |
| Smitten | Ice cream | Too sweet (stated 2026-06-15). |

### Closed — do not recommend (verified)
| Place | Was | Closed |
|---|---|---|
| Mourad | Moroccan, SoMa | Oct 2024 |
| Al's Place | Vegetable-forward, Mission | 2022 |
| Gracias Madre | Vegan Mexican, Mission | Aug 2023 |

---
_Always verify a place is currently open before recommending — SF turnover is high._
