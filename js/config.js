// ══════════════════════════════════════════════════════════════
//  WEEKLY WONDERS — league configuration
//  Everything you might want to change in a season lives here.
// ══════════════════════════════════════════════════════════════

export const LEAGUE = {
  id: 384071,
  inviteCode: 'd16bqa',
  season: '2026/27',
  edition: '4th Edition',
  entryFee: 76,
  players: 15
};

// ── Prize structure ───────────────────────────────────────────
// Weekly money is computed from these rules, never hand-typed.
//
// Balances exactly: 15 x £76 = £1,140 in.
//   38 weeks x £22 = £836  +  season £255  +  cup £30  +  high £19
//                          = £1,140 out.
export const PRIZES = {
  weekly: {
    first:  14,
    second: 8,
    // A tie for top merges both pots and splits them between the
    // tied managers — nobody takes a runner-up prize that week.
    // Keeps every week's payout at exactly £22.
    shareTiedPositions: true
  },
  season: {
    1: 100,
    2: 75,
    3: 50,
    4: 30
  },
  cup: {
    winner: 20,
    runnerUp: 10
  },
  // Single biggest gameweek score of the season
  highestGW: 19
};

// ── Losers league ─────────────────────────────────────────────
export const LOSERS = {
  // Finishing bottom of the gameweek counts as one "loss".
  // If several tie on the bottom score, they all take the loss.
  tiedBottomAllCount: true
};

// ── FPL chip names → display ──────────────────────────────────
export const CHIP_LABELS = {
  wildcard:  { short: 'WC', name: 'Wildcard' },
  bboost:    { short: 'BB', name: 'Bench Boost' },
  '3xc':     { short: 'TC', name: 'Triple Captain' },
  freehit:   { short: 'FH', name: 'Free Hit' },
  manager:   { short: 'MG', name: 'Assistant Manager' }
};

// ── Roster ────────────────────────────────────────────────────
// Keyed by FPL entry id, NOT by name: Rudy plays under his dad's
// account, so two entries in this league are both called
// "Danny Nugent" and matching on name would swap their seasons.
//
// Entry ids are reissued by FPL every season — these are 26/27.
export const ROSTER = {
  2002141: { nick: 'STEER',   display: 'Tom Steer'         },
  5401784: { nick: 'BEN',     display: 'Ben Tosh'          },
  1988195: { nick: 'PGSM',    display: 'Philip Green'      },
  1214111: { nick: 'SEAN',    display: 'Sean Elliott'      },
  2401345: { nick: 'BAZ',     display: 'Barry Heath'       },
  4796726: { nick: 'CAT',     display: 'Richard Catling'   },
  6570197: { nick: 'ALEX',    display: 'Alex Roberts'      },
  5985503: { nick: 'ANDREA',  display: 'Andrea Elliott'    },
  6383904: { nick: 'ADAM',    display: 'Adam Roberts'      },
  1537481: { nick: 'BOBBY',   display: 'Bobby Roberts'     },
  7897510: { nick: 'PASS',    display: 'Sam Passmore'      },
  2836080: { nick: 'BLEASE',  display: 'Simon Bleasdale'   },
  6431272: { nick: 'DANNY',   display: 'Danny Nugent'      },  // "Cunha dig it"
  6572889: { nick: 'RUDY',    display: 'Rudy Nugent',
             note: "plays under Danny's account"           },  // "The minion boys"
  8556697: { nick: 'CHARLIE', display: 'Charlie Passmore'  }
};

// Managers who played a previous season but are not in 26/27.
export const DEPARTED = ['JO'];

// ── Admin ─────────────────────────────────────────────────────
// Nothing here. This file is served to the browser, so the PIN and
// the tracking URL live server-side in api/_secrets.js and are
// never sent to the page. Last season both sat in the page source.

// ── Refresh cadence ───────────────────────────────────────────
export const REFRESH = {
  liveMs:  90_000,     // while a gameweek is in play
  idleMs:  900_000,    // between gameweeks
  staleMs: 3_600_000   // warn the viewer if data is older than this
};
