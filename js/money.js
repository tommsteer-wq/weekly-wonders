// ══════════════════════════════════════════════════════════════
//  MONEY ENGINE
//
//  Last season the money table was typed by hand, and it drifted
//  — there are two "missed in spreadsheet" corrections sitting in
//  the old file. This computes every figure from the gameweek
//  scores and the prize rules instead, so it cannot drift again.
//
//  It also runs on the LIVE gameweek, which is what makes the
//  provisional money table possible mid-week.
// ══════════════════════════════════════════════════════════════

import { PRIZES, LOSERS } from './config.js';

const round2 = n => Math.round(n * 100) / 100;

/**
 * Settle one gameweek.
 * @param {Array<{nick:string, pts:number}>} scores - every manager's net score
 * @returns {{winners:string[], runnersUp:string[], bottom:string[], payouts:Object, top:number, low:number, avg:number}}
 */
export function settleGameweek(scores) {
  const valid = scores.filter(s => Number.isFinite(s.pts));
  if (!valid.length) return { winners: [], runnersUp: [], bottom: [], payouts: {}, top: 0, low: 0, avg: 0 };

  const sorted = [...valid].sort((a, b) => b.pts - a.pts);
  const top = sorted[0].pts;
  const low = sorted[sorted.length - 1].pts;

  const winners = sorted.filter(s => s.pts === top).map(s => s.nick);

  // Second place is the next distinct score below the top.
  const secondScore = sorted.find(s => s.pts < top)?.pts ?? null;
  const runnersUp = secondScore === null ? [] : sorted.filter(s => s.pts === secondScore).map(s => s.nick);

  const bottom = sorted.filter(s => s.pts === low).map(s => s.nick);

  // ── payouts ────────────────────────────────────────────────
  const payouts = {};
  const add = (nick, amt) => { payouts[nick] = round2((payouts[nick] || 0) + amt); };

  const { first, second, shareTiedPositions } = PRIZES.weekly;

  if (winners.length === 1) {
    add(winners[0], first);
    runnersUp.forEach(n => add(n, second / runnersUp.length));
  } else if (shareTiedPositions) {
    // A tie at the top swallows the runner-up prize: the two pots merge.
    const potShared = first + second;
    if (winners.length === 2) {
      winners.forEach(n => add(n, potShared / 2));
    } else {
      // Three or more tied at the top share both pots between them.
      winners.forEach(n => add(n, potShared / winners.length));
    }
  } else {
    winners.forEach(n => add(n, first / winners.length));
    runnersUp.forEach(n => add(n, second / runnersUp.length));
  }

  const avg = valid.reduce((a, s) => a + s.pts, 0) / valid.length;

  return { winners, runnersUp, bottom, payouts, top, low, avg: round2(avg) };
}

/**
 * Run the whole season through the rules.
 * @param {string[]} nicks
 * @param {Object<string, number[]>} gwPts - nick -> [gw1, gw2, ...]
 * @param {Object} opts
 * @returns {{ledger:Object, weeks:Array}}
 */
export function settleSeason(nicks, gwPts, opts = {}) {
  const {
    upToGW = null,          // ignore gameweeks after this (used to exclude a live week)
    seasonPositions = null, // {nick: finalRank} once the season is done
    cup = null,             // {winner, runnerUp}
    includeHighestGW = true
  } = opts;

  const gwCount = Math.max(...nicks.map(n => (gwPts[n] || []).length), 0);
  const limit = upToGW ?? gwCount;

  const ledger = Object.fromEntries(nicks.map(n => [n, {
    nick: n,
    weekly: 0, wins: 0, seconds: 0,
    losses: 0,          // times finishing bottom
    season: 0, cup: 0, highest: 0,
    total: 0
  }]));

  const weeks = [];

  for (let gw = 1; gw <= limit; gw++) {
    const scores = nicks
      .map(n => ({ nick: n, pts: gwPts[n]?.[gw - 1] }))
      .filter(s => Number.isFinite(s.pts));

    if (scores.length < 2) continue;

    const w = settleGameweek(scores);
    weeks.push({ gw, ...w });

    for (const [nick, amt] of Object.entries(w.payouts)) {
      if (!ledger[nick]) continue;
      ledger[nick].weekly = round2(ledger[nick].weekly + amt);
    }
    w.winners.forEach(n => ledger[n] && ledger[n].wins++);
    w.runnersUp.forEach(n => ledger[n] && ledger[n].seconds++);
    if (LOSERS.tiedBottomAllCount) {
      w.bottom.forEach(n => ledger[n] && ledger[n].losses++);
    } else if (w.bottom.length === 1) {
      ledger[w.bottom[0]].losses++;
    }
  }

  // ── end-of-season prizes ───────────────────────────────────
  if (seasonPositions) {
    for (const [nick, rank] of Object.entries(seasonPositions)) {
      const prize = PRIZES.season[rank];
      if (prize && ledger[nick]) ledger[nick].season = prize;
    }
  }
  if (cup) {
    if (cup.winner && ledger[cup.winner])       ledger[cup.winner].cup = PRIZES.cup.winner;
    if (cup.runnerUp && ledger[cup.runnerUp])   ledger[cup.runnerUp].cup = PRIZES.cup.runnerUp;
  }
  if (includeHighestGW && weeks.length) {
    let best = { pts: -Infinity, nicks: [] };
    for (const n of nicks) {
      (gwPts[n] || []).slice(0, limit).forEach(p => {
        if (!Number.isFinite(p)) return;
        if (p > best.pts) best = { pts: p, nicks: [n] };
        else if (p === best.pts && !best.nicks.includes(n)) best.nicks.push(n);
      });
    }
    if (best.nicks.length) {
      const each = round2(PRIZES.highestGW / best.nicks.length);
      best.nicks.forEach(n => { if (ledger[n]) ledger[n].highest = each; });
    }
  }

  for (const l of Object.values(ledger)) {
    l.total = round2(l.weekly + l.season + l.cup + l.highest);
  }

  return { ledger, weeks };
}

/** Money table, richest first. */
export function moneyTable(ledger) {
  return Object.values(ledger).sort((a, b) => b.total - a.total || b.wins - a.wins);
}

/** Losers table, most bottom-finishes first. */
export function losersTable(ledger) {
  return Object.values(ledger).sort((a, b) => b.losses - a.losses || a.total - b.total);
}

/** What each manager is up or down against their entry fee. */
export function balances(ledger, entryFee) {
  return Object.values(ledger)
    .map(l => ({ nick: l.nick, winnings: l.total, entryFee, balance: round2(l.total - entryFee) }))
    .sort((a, b) => b.balance - a.balance);
}

export const fmtMoney = n => {
  const v = Math.abs(n);
  const s = v % 1 === 0 ? v.toFixed(0) : v.toFixed(2);
  return (n < 0 ? '−£' : '£') + s;
};
