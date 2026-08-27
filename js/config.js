// ══════════════════════════════════════════════════════════════
//  WEEKLY WONDERS — league configuration
//  Everything you might want to change in a season lives here.
// ══════════════════════════════════════════════════════════════

export const LEAGUE = {
  id: null,                       // ← FPL numeric league id for 26/27. Set this.
  inviteCode: 'd16bqa',
  season: '2026/27',
  edition: '4th Edition',
  entryFee: 76
};

// ── Prize structure ───────────────────────────────────────────
// Weekly money is computed from these rules, never hand-typed.
export const PRIZES = {
  weekly: {
    first:  13,
    second: 7,
    // Ties share the pot for that position evenly.
    // e.g. two managers tied on top share (13 + 7) / 2 = £10 each.
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

// ── Roster overrides ──────────────────────────────────────────
// The dashboard reads the real roster from the FPL API, so you
// normally do not touch this. Use it only to pin a short display
// name (the "nick") to a manager, or to note who has left.
export const NICKNAMES = {
  // 'FPL manager name': 'NICK'
  'Tom Steer':        'STEER',
  'Ben Tosh':         'BEN',
  'Philip Green':     'PGSM',
  'Sean Elliott':     'SEAN',
  'Barry Heath':      'BAZ',
  'Richard Catling':  'CAT',
  'Alexander Roberts':'ALEX',
  'Alex Roberts':     'ALEX',
  'Andrea Elliott':   'ANDREA',
  'Adam Roberts':     'ADAM',
  'Bobby Roberts':    'BOBBY',
  'Sam Passmore':     'PASS',
  'Simon Bleasdale':  'BLEASE',
  'Danny Nugent':     'DANNY',
  'Charlie Passmore': 'CHARLIE',
  'Rudy Nugent':      'RUDY'
};

// Managers who played a previous season but are not in 26/27.
export const DEPARTED = ['JO'];

// ── Admin ─────────────────────────────────────────────────────
export const ADMIN = {
  // Session tracking backend (Google Apps Script from last season).
  trackingUrl: 'https://script.google.com/macros/s/AKfycbyQG7rbVCHCc7fGXXYIf9105rBUq8_MyI_4jkfFGzDFAISrKVEHtvK0nySHEFRLEpkmnA/exec',
  // NOTE: anything here is visible in the page source. This gate
  // keeps the tab tidy; it is not real security.
  pin: '39373'
};

// ── Refresh cadence ───────────────────────────────────────────
export const REFRESH = {
  liveMs:  90_000,     // while a gameweek is in play
  idleMs:  900_000,    // between gameweeks
  staleMs: 3_600_000   // warn the viewer if data is older than this
};
