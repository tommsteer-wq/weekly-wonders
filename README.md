# Weekly Wonders — 4th Edition

The dashboard for our Fantasy Premier League. Live at
**https://weekly-wonders.vercel.app**

FPL league `384071` · invite code `d16bqa` · 15 managers · 2026/27.

---

## How updating works now

There is no drag-and-drop any more. The repo is connected to Vercel,
so **pushing to `main` deploys the site** in about twenty seconds.

```bash
git add -A && git commit -m "what changed" && git push
```

That's the whole process. Nothing to click on Vercel.

## How the data works

Nothing about the league is typed in by hand. The site reads the
official FPL API through three of our own endpoints, so there is no
CORS proxy in the chain and one cached response serves everybody:

| Endpoint | What it does | Cached for |
|---|---|---|
| `/api/season` | Standings and every manager's full gameweek history | 15 min (2 min when live) |
| `/api/live` | Live gameweek scores and captains, computed from picks × live player points | 90 sec when live |
| `/api/captains` | Captain picks for a batch of gameweeks | 24 h once a gameweek is final |

The page refreshes itself every 90 seconds while a gameweek is in
play and every 15 minutes otherwise, so the money table moves as the
goals go in.

Captain history is fetched in chunks and cached in the browser.
A finished gameweek's captain never changes, so it is only ever
fetched once — without that, GW38 would mean 570 upstream calls on
every page load.

## The money

`js/money.js` derives every figure from the gameweek scores and the
rules in `js/config.js`. Last season's table was kept by hand and
drifted; this cannot.

Current rules — see `js/config.js` to change any of them:

- **£14** weekly winner, **£8** weekly runner-up
- A **tie at the top merges both pots** and splits them; nobody takes
  the runner-up prize that week
- Ties for second split the £8 evenly
- **Bottom of the week takes a loss**; if several tie on the bottom
  score they all take one
- Season: £100 / £75 / £50 / £30 · Cup £20 / £10 · Highest GW £19
- Scores are **net of transfer hits**

It balances exactly: 15 × £76 = **£1,140** in, £1,140 out.

Money is only banked once FPL marks a gameweek `data_checked`
(bonus applied). Before that it shows on the Live tab as provisional.

## Layout

```
index.html            the shell — header, tabs, footer
css/app.css           "Midnight & Brass" design system
api/_fpl.js           shared fetch helper, concurrency pool, cache headers
api/season.js         standings + histories
api/live.js           live scores + captains
api/captains.js       chunked captain history
js/config.js          league id, prize rules, roster        ← edit this
js/money.js           the money engine
js/api.js             client fetch + localStorage caching
js/render.js          2026/27 tab renderers
js/render-archive.js  2025/26 tab renderers
js/data-2526.js       frozen 25/26 season — do not edit
js/app.js             state, navigation, auto-refresh
archive/              the original single-file 3rd Edition dashboard
```

### The roster is keyed by entry id, not by name

Rudy plays under his dad's FPL account, so two entries in the league
are both called "Danny Nugent". Matching on name would swap their
seasons. `ROSTER` in `js/config.js` maps entry id → nickname.

**FPL reissues entry ids and league ids every season.** None of last
season's ids still point at the right people. At the start of 27/28,
update `LEAGUE.id` and every key in `ROSTER`.

## Running it locally

```bash
npm run dev
```

Serves on http://localhost:5174 and routes `/api/*` to the handlers
the same way Vercel does.

Note: the dev server caches `api/_fpl.js` between requests. If you
edit that file, restart the server.

## 2025/26

The previous season is frozen in `js/data-2526.js` — 14 managers, the
full 14 × 38 points grid, chips, the final money table and all 38
weekly reports. It is reachable from the **25/26** switch in the
header.

That season is settled, so the money shown there is the **recorded**
figure, not a recomputed one. It is the historical record; leave it
alone.
