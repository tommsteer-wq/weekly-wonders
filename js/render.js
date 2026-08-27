// ══════════════════════════════════════════════════════════════
//  Tab renderers for the current (2026/27) season.
//  Every function takes the app state and returns HTML.
// ══════════════════════════════════════════════════════════════

import { CHIP_LABELS, PRIZES, LEAGUE } from './config.js';
import { settleSeason, settleGameweek, moneyTable, losersTable } from './money.js';
import { esc, fmt, money, ordinal, movement, mgrCell, rowClass, empty, stats, pct, avatar } from './ui.js';

const chipTag = c => {
  if (!c) return '';
  const l = CHIP_LABELS[c];
  return `<span class="pill brass" title="${esc(l?.name || c)}">${esc(l?.short || c)}</span>`;
};

/* ════════════════════════════ LIVE ════════════════════════════ */
export function renderLive(s) {
  const live = s.live;
  if (!live || !live.gw) {
    return empty('The season has not started', 'Live scores will appear here once the first gameweek kicks off.', '○');
  }

  const ready = live.managers.filter(m => m.ready).sort((a, b) => a.liveRank - b.liveRank);
  if (!ready.length) {
    return empty(`Waiting on GW${live.gw} teams`,
      'Nobody has a confirmed squad for this gameweek yet. Check back after the deadline.', '○');
  }

  // This week's payouts, using the same engine as the season.
  const week = settleGameweek(ready.map(m => ({ nick: m.nick, pts: m.livePts })));

  // If FPL has already checked this gameweek it is in the ledger
  // proper, so it must NOT be added again as a provisional payout.
  const banked = live.gw <= (s.settledUpTo || 0);

  const statusPill = live.isLive
    ? `<span class="pill live">● In play</span>`
    : live.dataChecked
      ? `<span class="pill pos">Final</span>`
      : `<span class="pill">Provisional</span>`;

  const top = ready[0].livePts;
  const leagueAvg = Math.round(ready.reduce((a, m) => a + m.livePts, 0) / ready.length);

  const rows = ready.map((m, i) => {
    const pay = week.payouts[m.nick] || 0;
    const isBottom = week.bottom.includes(m.nick);
    return `
      <tr class="${rowClass(i, ready.length, m.nick === s.me)}">
        <td class="rank">${m.liveRank}</td>
        <td>${mgrCell(m.display, m.team)}</td>
        <td class="right"><span class="total">${fmt(m.livePts)}</span>${m.hit ? `<span class="dim" style="font-size:11px"> (−${m.hit})</span>` : ''}</td>
        <td>
          <div class="meter" style="min-width:70px"><span style="width:${pct(m.livePts, top)}%"></span></div>
        </td>
        <td class="center">${m.captain
          ? `<span class="${m.captain.played ? '' : 'dim'}">${esc(m.captain.web)}</span>
             <span class="pill ${m.captain.scored >= 12 ? 'pos' : m.captain.scored <= 4 ? 'neg' : ''}">${m.captain.scored}</span>`
          : '<span class="dim">—</span>'}</td>
        <td class="center">${chipTag(m.chip) || '<span class="dim">—</span>'}</td>
        <td class="center dim nowrap">${live.finished
          ? (m.playersLeft > 0 ? `${m.playersLeft} didn't feature` : '<span class="pos">full XI played</span>')
          : (m.playersLeft > 0 ? `${m.playersLeft} to play` : '<span class="pos">all played</span>')}</td>
        <td class="right">${pay > 0
          ? `<span class="money pos">${money(pay)}</span>`
          : isBottom ? `<span class="pill neg">bottom</span>` : '<span class="dim">—</span>'}</td>
      </tr>`;
  }).join('');

  const winners = week.winners.map(n => s.byNick[n]?.display || n).join(' & ');
  const bottom  = week.bottom.map(n => s.byNick[n]?.display || n).join(' & ');

  return `
    <div class="grid grid-4" style="margin-bottom:16px">
      <div class="stat accent">
        <div class="stat-label">Leading GW${live.gw}</div>
        <div class="stat-value">${esc(winners)}</div>
        <div class="stat-meta">${fmt(top)} pts · ${money(week.payouts[week.winners[0]] || 0)}</div>
      </div>
      <div class="stat">
        <div class="stat-label">League average</div>
        <div class="stat-value">${leagueAvg}</div>
        <div class="stat-meta">FPL average ${live.fplAverage ?? '—'}</div>
      </div>
      <div class="stat">
        <div class="stat-label">Propping it up</div>
        <div class="stat-value">${esc(bottom)}</div>
        <div class="stat-meta">${fmt(week.low)} pts · takes the loss</div>
      </div>
      ${live.finished ? `
      <div class="stat">
        <div class="stat-label">Biggest captain</div>
        <div class="stat-value">${esc(topCaptain(live)?.web || '—')}</div>
        <div class="stat-meta">${topCaptain(live) ? `${topCaptain(live).raw * 2} pts · picked by ${topCaptain(live).count}` : ''}</div>
      </div>` : `
      <div class="stat">
        <div class="stat-label">Still to play</div>
        <div class="stat-value">${ready.reduce((a, m) => a + m.playersLeft, 0)}</div>
        <div class="stat-meta">players across the league</div>
      </div>`}
    </div>

    <div class="card">
      <div class="card-head">
        <h2>Gameweek ${live.gw} — live table</h2>
        <div style="display:flex;align-items:center;gap:10px">
          ${statusPill}
          <span class="sub">${esc(live.note)}</span>
        </div>
      </div>
      <div class="card-body flush">
        <div class="table-wrap">
          <table>
            <thead><tr>
              <th>#</th><th>Manager</th><th class="right">Live</th><th></th>
              <th class="center">Captain</th><th class="center">Chip</th>
              <th class="center">Progress</th><th class="right">This week</th>
            </tr></thead>
            <tbody>${rows}</tbody>
          </table>
        </div>
      </div>
    </div>

    ${renderProvisionalMoney(s, week, banked)}
  `;
}

const topCaptain = live =>
  [...(live.captainBoard || [])].sort((a, b) => b.raw - a.raw)[0] || null;

/* ── how this week moves the money, before it is settled ─────── */
function renderProvisionalMoney(s, week, banked) {
  const rows = moneyTable(s.ledger)
    .map(l => {
      // Once a gameweek is checked its money is already in the
      // ledger — showing it again as an addition double-counts it.
      const add = banked ? 0 : (week.payouts[l.nick] || 0);
      const lossAdd = banked ? 0 : (week.bottom.includes(l.nick) ? 1 : 0);
      return { ...l, add, lossAdd, projected: Math.round((l.total + add) * 100) / 100 };
    })
    .sort((a, b) => b.projected - a.projected);

  const body = rows.map((l, i) => {
    const m = s.byNick[l.nick];
    return `
      <tr class="${rowClass(i, rows.length, l.nick === s.me)}">
        <td class="rank">${i + 1}</td>
        <td>${mgrCell(m?.display || l.nick, m?.team)}</td>
        <td class="right money">${money(l.total)}</td>
        <td class="right">${l.add > 0 ? `<span class="pill pos">+${money(l.add)}</span>` : '<span class="dim">—</span>'}</td>
        <td class="right"><span class="total">${money(l.projected)}</span></td>
        <td class="center">${l.losses + l.lossAdd}${l.lossAdd ? ' <span class="pill neg">+1</span>' : ''}</td>
      </tr>`;
  }).join('');

  return `
    <div class="card">
      <div class="card-head">
        <h2>${banked ? 'Money league' : 'Money league — if the week ended now'}</h2>
        <span class="sub">${banked
          ? `Gameweek ${s.settledUpTo} is settled and included`
          : "Confirmed money, plus this week's provisional payout"}</span>
      </div>
      <div class="card-body flush">
        <div class="table-wrap">
          <table>
            <thead><tr>
              <th>#</th><th>Manager</th><th class="right">Banked</th>
              <th class="right">This week</th><th class="right">Projected</th><th class="center">Losses</th>
            </tr></thead>
            <tbody>${body}</tbody>
          </table>
        </div>
      </div>
    </div>`;
}

/* ═══════════════════════════ TABLE ════════════════════════════ */
export function renderTable(s) {
  const ms = [...s.managers].sort((a, b) => a.rank - b.rank);
  const leader = ms[0]?.total ?? 0;
  const gwCount = s.gameweek.lastFinishedGW || 0;

  const rows = ms.map((m, i) => `
    <tr class="${rowClass(i, ms.length, m.nick === s.me)}">
      <td class="rank">${m.rank}</td>
      <td class="center">${movement(m.rank, m.lastRank)}</td>
      <td>${mgrCell(m.display, m.team)}</td>
      <td class="right"><span class="total">${fmt(m.total)}</span></td>
      <td class="right dim">${i === 0 ? '—' : '−' + fmt(leader - m.total)}</td>
      <td class="right">${fmt(m.gwPts)}</td>
      <td class="center">${formDots(m.pts, 5)}</td>
      <td class="right dim">${m.totalHits ? '−' + m.totalHits : '0'}</td>
      <td class="right dim">${fmt(m.benchTotal)}</td>
    </tr>`).join('');

  return `
    ${renderHeadline(s)}
    <div class="card">
      <div class="card-head">
        <h2>League table</h2>
        <span class="sub">${gwCount ? `After gameweek ${gwCount}` : 'Season not started'}</span>
      </div>
      <div class="card-body flush">
        <div class="table-wrap">
          <table>
            <thead><tr>
              <th>#</th><th class="center">Mv</th><th>Manager</th>
              <th class="right">Total</th><th class="right">Gap</th><th class="right">Last GW</th>
              <th class="center">Form</th><th class="right" title="Points lost to transfer hits">Hits</th>
              <th class="right" title="Points left on the bench">Bench</th>
            </tr></thead>
            <tbody>${rows}</tbody>
          </table>
        </div>
      </div>
    </div>`;
}

function formDots(pts, n) {
  const recent = (pts || []).slice(-n);
  if (!recent.length) return '<span class="dim">—</span>';
  const all = recent.filter(Number.isFinite);
  const hi = Math.max(...all), lo = Math.min(...all);
  return `<div class="form-row">${recent.map(p => {
    const cls = p === hi && hi !== lo ? 'hot' : p === lo && hi !== lo ? 'cold' : '';
    return `<span class="form-dot ${cls}">${p}</span>`;
  }).join('')}</div>`;
}

function renderHeadline(s) {
  const ms = s.managers;
  if (!ms.length) return '';
  const sorted = [...ms].sort((a, b) => a.rank - b.rank);
  const allPts = ms.flatMap(m => m.pts);
  const best = Math.max(...allPts, 0);
  const bestMgr = ms.find(m => m.pts.includes(best));
  const bestGW = bestMgr ? bestMgr.pts.indexOf(best) + 1 : null;
  const gap = sorted.length > 1 ? sorted[0].total - sorted[1].total : 0;

  return `
    <div class="grid grid-4" style="margin-bottom:16px">
      <div class="stat accent">
        <div class="stat-label">Top of the pile</div>
        <div class="stat-value">${esc(sorted[0].display)}</div>
        <div class="stat-meta">${fmt(sorted[0].total)} pts · ${gap > 0 ? `${gap} clear` : 'level at the top'}</div>
      </div>
      <div class="stat">
        <div class="stat-label">Best gameweek</div>
        <div class="stat-value">${fmt(best)}</div>
        <div class="stat-meta">${bestMgr ? `${esc(bestMgr.display)}, GW${bestGW}` : '—'}</div>
      </div>
      <div class="stat">
        <div class="stat-label">Bench regrets</div>
        <div class="stat-value">${fmt(Math.max(...ms.map(m => m.benchTotal), 0))}</div>
        <div class="stat-meta">${esc([...ms].sort((a, b) => b.benchTotal - a.benchTotal)[0]?.display || '—')} left the most on</div>
      </div>
      <div class="stat">
        <div class="stat-label">Burnt on hits</div>
        <div class="stat-value">${fmt(ms.reduce((a, m) => a + m.totalHits, 0))}</div>
        <div class="stat-meta">points, league-wide</div>
      </div>
    </div>`;
}

/* ═══════════════════════════ MONEY ════════════════════════════ */
export function renderMoney(s) {
  const table = moneyTable(s.ledger);
  const losers = losersTable(s.ledger);
  const maxWin = Math.max(...table.map(l => l.total), 1);

  const moneyRows = table.map((l, i) => {
    const m = s.byNick[l.nick];
    return `
      <tr class="${rowClass(i, table.length, l.nick === s.me)}">
        <td class="rank">${i + 1}</td>
        <td>${mgrCell(m?.display || l.nick, m?.team)}</td>
        <td class="right"><span class="total ${l.total > 0 ? 'pos' : 'dim'}">${money(l.total)}</span></td>
        <td style="width:110px"><div class="meter pos"><span style="width:${pct(l.total, maxWin)}%"></span></div></td>
        <td class="center">${l.wins || '<span class="dim">0</span>'}</td>
        <td class="center">${l.seconds || '<span class="dim">0</span>'}</td>
        <td class="right ${l.total - LEAGUE.entryFee >= 0 ? 'pos' : 'neg'}">${money(l.total - LEAGUE.entryFee)}</td>
      </tr>`;
  }).join('');

  const maxLoss = Math.max(...losers.map(l => l.losses), 1);
  const loserRows = losers.map((l, i) => {
    const m = s.byNick[l.nick];
    return `
      <tr class="${l.nick === s.me ? 'is-me' : ''}">
        <td class="rank">${i + 1}</td>
        <td>${mgrCell(m?.display || l.nick, m?.team)}</td>
        <td class="right"><span class="total ${l.losses ? 'neg' : 'dim'}">${l.losses}</span></td>
        <td style="width:110px"><div class="meter neg"><span style="width:${pct(l.losses, maxLoss)}%"></span></div></td>
      </tr>`;
  }).join('');

  const paidOut = table.reduce((a, l) => a + l.total, 0);
  const potTotal = LEAGUE.entryFee * LEAGUE.players;

  return `
    <div class="grid grid-4" style="margin-bottom:16px">
      <div class="stat accent">
        <div class="stat-label">Richest</div>
        <div class="stat-value">${esc(s.byNick[table[0]?.nick]?.display || '—')}</div>
        <div class="stat-meta">${money(table[0]?.total || 0)} banked</div>
      </div>
      <div class="stat">
        <div class="stat-label">Paid out so far</div>
        <div class="stat-value">${money(paidOut)}</div>
        <div class="stat-meta">of a ${money(potTotal)} pot</div>
      </div>
      <div class="stat">
        <div class="stat-label">Weekly pot</div>
        <div class="stat-value">${money(PRIZES.weekly.first + PRIZES.weekly.second)}</div>
        <div class="stat-meta">${money(PRIZES.weekly.first)} first · ${money(PRIZES.weekly.second)} second</div>
      </div>
      <div class="stat">
        <div class="stat-label">Most losses</div>
        <div class="stat-value">${losers[0]?.losses || 0}</div>
        <div class="stat-meta">${esc(s.byNick[losers[0]?.nick]?.display || '—')}</div>
      </div>
    </div>

    <div class="grid grid-2">
      <div class="card">
        <div class="card-head">
          <h2>Money league</h2>
          <span class="sub">Computed from the scores</span>
        </div>
        <div class="card-body flush">
          <div class="table-wrap">
            <table>
              <thead><tr>
                <th>#</th><th>Manager</th><th class="right">Won</th><th></th>
                <th class="center" title="Weekly wins">W</th><th class="center" title="Weekly runner-up">2nd</th>
                <th class="right" title="Winnings minus the £76 entry fee">vs fee</th>
              </tr></thead>
              <tbody>${moneyRows}</tbody>
            </table>
          </div>
        </div>
      </div>

      <div class="card">
        <div class="card-head">
          <h2>Losers league</h2>
          <span class="sub">Times finishing bottom of the week</span>
        </div>
        <div class="card-body flush">
          <div class="table-wrap">
            <table>
              <thead><tr><th>#</th><th>Manager</th><th class="right">Losses</th><th></th></tr></thead>
              <tbody>${loserRows}</tbody>
            </table>
          </div>
        </div>
      </div>
    </div>`;
}

/* ══════════════════════════ CAPTAINS ══════════════════════════ */
export function renderCaptains(s) {
  const live = s.live;
  const hist = s.captains?.rows || [];

  if (!live?.gw && !hist.length) {
    return empty('No captains yet', 'This fills in as soon as the first deadline passes.', '©');
  }

  /* ── this week's picks ── */
  const board = (live?.captainBoard || []).map(c => `
    <tr>
      <td>
        <div class="mgr">
          ${avatar(c.web)}
          <div style="min-width:0">
            <div class="mgr-name">${esc(c.web)}</div>
            <div class="mgr-team">${esc(c.team)} · ${esc(c.pos)}</div>
          </div>
        </div>
      </td>
      <td class="center"><span class="pill ${c.count >= 5 ? 'brass' : ''}">${c.count}</span></td>
      <td class="right"><span class="total ${c.raw >= 8 ? 'pos' : c.raw <= 2 && c.played ? 'neg' : ''}">${c.raw}</span></td>
      <td class="right dim">${(c.raw * 2)}</td>
      <td class="dim" style="font-size:11.5px">${esc(c.by.map(id => s.byEntry[id]?.display || id).join(', '))}</td>
    </tr>`).join('');

  /* ── season-long captain league ── */
  const byNick = {};
  for (const r of hist) {
    const nick = s.byEntry[r.entry]?.nick;
    if (!nick) continue;
    (byNick[nick] = byNick[nick] || []).push(r);
  }

  const seasonRows = Object.entries(byNick).map(([nick, rows]) => {
    const scored = rows.map(r => r.captain.scored);
    const raw = rows.map(r => r.captain.raw);
    const st = stats(scored);
    const blanks = raw.filter(p => p <= 2).length;
    const hauls  = raw.filter(p => p >= 10).length;
    const best = rows.reduce((a, r) => r.captain.scored > (a?.captain.scored ?? -1) ? r : a, null);
    const worst = rows.reduce((a, r) => r.captain.scored < (a?.captain.scored ?? 1e9) ? r : a, null);
    return {
      nick, n: rows.length,
      avg: st.mean, total: scored.reduce((a, b) => a + b, 0),
      blanks, hauls, best, worst
    };
  }).sort((a, b) => b.avg - a.avg);

  const maxAvg = Math.max(...seasonRows.map(r => r.avg), 1);

  const seasonBody = seasonRows.length ? seasonRows.map((r, i) => {
    const m = s.byNick[r.nick];
    return `
      <tr class="${rowClass(i, seasonRows.length, r.nick === s.me)}">
        <td class="rank">${i + 1}</td>
        <td>${mgrCell(m?.display || r.nick, m?.team)}</td>
        <td class="right"><span class="total">${r.avg.toFixed(1)}</span></td>
        <td style="width:100px"><div class="meter"><span style="width:${pct(r.avg, maxAvg)}%"></span></div></td>
        <td class="right dim">${r.total}</td>
        <td class="center">${r.hauls ? `<span class="pill pos">${r.hauls}</span>` : '<span class="dim">0</span>'}</td>
        <td class="center">${r.blanks ? `<span class="pill neg">${r.blanks}</span>` : '<span class="dim">0</span>'}</td>
        <td class="dim nowrap" style="font-size:11.5px">${r.best ? `${esc(r.best.captain.web)} ${r.best.captain.scored}` : '—'}</td>
        <td class="dim nowrap" style="font-size:11.5px">${r.worst ? `${esc(r.worst.captain.web)} ${r.worst.captain.scored}` : '—'}</td>
      </tr>`;
  }).join('') : `<tr><td colspan="9">${empty('Building captain history', 'Loading past gameweeks…', '·')}</td></tr>`;

  /* ── differentials: who went it alone this week ── */
  const solo = (live?.captainBoard || []).filter(c => c.count === 1);
  const soloHtml = solo.length ? `
    <div class="card">
      <div class="card-head"><h2>Went it alone</h2><span class="sub">Captains nobody else picked in GW${live.gw}</span></div>
      <div class="card-body">
        <div class="grid grid-3">
          ${solo.map(c => {
            const who = s.byEntry[c.by[0]]?.display || c.by[0];
            const good = c.raw >= 8;
            return `<div class="stat ${good ? 'accent' : ''}">
              <div class="stat-label">${esc(who)}</div>
              <div class="stat-value" style="font-size:20px">${esc(c.web)}</div>
              <div class="stat-meta ${good ? 'pos' : c.played ? 'neg' : ''}">${c.raw * 2} pts${good ? ' — vindicated' : c.played ? ' — ouch' : ' — yet to play'}</div>
            </div>`;
          }).join('')}
        </div>
      </div>
    </div>` : '';

  return `
    ${live?.gw ? `
    <div class="card">
      <div class="card-head">
        <h2>Gameweek ${live.gw} armbands</h2>
        <span class="sub">${live.captainBoard.length} different captain${live.captainBoard.length === 1 ? '' : 's'} across ${s.managers.length} managers</span>
      </div>
      <div class="card-body flush">
        <div class="table-wrap">
          <table>
            <thead><tr>
              <th>Player</th><th class="center">Picked by</th>
              <th class="right">Points</th><th class="right">Captained</th><th>Managers</th>
            </tr></thead>
            <tbody>${board || `<tr><td colspan="5">${empty('No captains set', 'Teams are not confirmed yet.', '·')}</td></tr>`}</tbody>
          </table>
        </div>
      </div>
    </div>` : ''}

    ${soloHtml}

    <div class="card">
      <div class="card-head">
        <h2>Captain league</h2>
        <span class="sub">Average return per gameweek, after the armband</span>
      </div>
      <div class="card-body flush">
        <div class="table-wrap">
          <table>
            <thead><tr>
              <th>#</th><th>Manager</th><th class="right">Avg</th><th></th><th class="right">Total</th>
              <th class="center" title="Captain returned 10+ raw points">Hauls</th>
              <th class="center" title="Captain returned 2 or fewer">Blanks</th>
              <th>Best call</th><th>Worst call</th>
            </tr></thead>
            <tbody>${seasonBody}</tbody>
          </table>
        </div>
      </div>
    </div>`;
}

/* ═══════════════════════════ CHIPS ════════════════════════════ */
export function renderChips(s) {
  const order = ['wildcard', 'bboost', '3xc', 'freehit'];
  const gwsLeft = 38 - (s.gameweek.lastFinishedGW || 0);

  const rows = [...s.managers].sort((a, b) => a.rank - b.rank).map(m => {
    const used = {};
    for (const c of m.chips) (used[c.name] = used[c.name] || []).push(c.gw);
    const cells = order.map(k => {
      const gws = used[k] || [];
      return `<td class="chip-cell">${gws.length
        ? gws.map(g => `<span class="chip-used">GW${g}</span>`).join(' ')
        : '<span class="chip-free">—</span>'}</td>`;
    }).join('');
    const remaining = order.filter(k => !(used[k] || []).length).length;
    return `
      <tr class="${m.nick === s.me ? 'is-me' : ''}">
        <td>${mgrCell(m.display, m.team)}</td>
        ${cells}
        <td class="center">${remaining
          ? `<span class="pill ${remaining >= 3 && gwsLeft < 10 ? 'neg' : ''}">${remaining} left</span>`
          : '<span class="pill pos">all used</span>'}</td>
      </tr>`;
  }).join('');

  return `
    <div class="card">
      <div class="card-head">
        <h2>Chip tracker</h2>
        <span class="sub">${gwsLeft} gameweek${gwsLeft === 1 ? '' : 's'} remaining</span>
      </div>
      <div class="card-body flush">
        <div class="table-wrap">
          <table>
            <thead><tr>
              <th>Manager</th>
              ${order.map(k => `<th class="center">${esc(CHIP_LABELS[k].name)}</th>`).join('')}
              <th class="center">Status</th>
            </tr></thead>
            <tbody>${rows}</tbody>
          </table>
        </div>
      </div>
    </div>`;
}

/* ══════════════════════════ EXTRAS ════════════════════════════ */
export function renderExtras(s) {
  const ms = s.managers;
  if (!ms.length || !ms[0].pts.length) {
    return empty('Nothing to show yet', 'These tables need a few gameweeks of scores behind them.', '·');
  }

  const bench = [...ms].sort((a, b) => b.benchTotal - a.benchTotal);
  const hits  = [...ms].sort((a, b) => b.totalHits - a.totalHits);
  const cons  = ms.map(m => ({ m, ...stats(m.pts) })).sort((a, b) => a.sd - b.sd);

  const best = ms.flatMap(m => m.pts.map((p, i) => ({ m, p, gw: i + 1 })))
    .sort((a, b) => b.p - a.p).slice(0, 10);

  const simple = (title, sub, rows, valLabel) => `
    <div class="card">
      <div class="card-head"><h2>${esc(title)}</h2><span class="sub">${esc(sub)}</span></div>
      <div class="card-body flush">
        <div class="table-wrap">
          <table>
            <thead><tr><th>#</th><th>Manager</th><th class="right">${esc(valLabel)}</th></tr></thead>
            <tbody>${rows}</tbody>
          </table>
        </div>
      </div>
    </div>`;

  return `
    <div class="grid grid-2">
      ${simple('Points left on the bench', 'The sad table', bench.map((m, i) => `
        <tr class="${m.nick === s.me ? 'is-me' : ''}">
          <td class="rank">${i + 1}</td><td>${mgrCell(m.display, m.team)}</td>
          <td class="right"><span class="total ${i === 0 ? 'neg' : ''}">${fmt(m.benchTotal)}</span></td>
        </tr>`).join(''), 'Bench pts')}

      ${simple('Burnt on transfer hits', 'Points paid for impatience', hits.map((m, i) => `
        <tr class="${m.nick === s.me ? 'is-me' : ''}">
          <td class="rank">${i + 1}</td><td>${mgrCell(m.display, m.team)}</td>
          <td class="right"><span class="total ${m.totalHits ? 'neg' : 'dim'}">${m.totalHits ? '−' + m.totalHits : '0'}</span></td>
        </tr>`).join(''), 'Hit cost')}
    </div>

    <div class="grid grid-2">
      <div class="card">
        <div class="card-head"><h2>Most consistent</h2><span class="sub">Lowest week-to-week swing</span></div>
        <div class="card-body flush">
          <div class="table-wrap">
            <table>
              <thead><tr><th>#</th><th>Manager</th><th class="right">Avg</th><th class="right">Swing</th><th class="right">Range</th></tr></thead>
              <tbody>${cons.map((c, i) => `
                <tr class="${c.m.nick === s.me ? 'is-me' : ''}">
                  <td class="rank">${i + 1}</td><td>${mgrCell(c.m.display, c.m.team)}</td>
                  <td class="right">${c.mean.toFixed(1)}</td>
                  <td class="right"><span class="total">±${c.sd.toFixed(1)}</span></td>
                  <td class="right dim">${c.min}–${c.max}</td>
                </tr>`).join('')}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div class="card">
        <div class="card-head"><h2>Biggest gameweeks</h2><span class="sub">Best single scores this season</span></div>
        <div class="card-body flush">
          <div class="table-wrap">
            <table>
              <thead><tr><th>#</th><th>Manager</th><th class="center">GW</th><th class="right">Points</th></tr></thead>
              <tbody>${best.map((b, i) => `
                <tr class="${b.m.nick === s.me ? 'is-me' : ''}">
                  <td class="rank">${i + 1}</td><td>${mgrCell(b.m.display, b.m.team)}</td>
                  <td class="center dim">GW${b.gw}</td>
                  <td class="right"><span class="total ${i === 0 ? 'pos' : ''}">${b.p}</span></td>
                </tr>`).join('')}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>`;
}

/* ══════════════════════════ PRIZES ════════════════════════════ */
export function renderPrizes() {
  const w = PRIZES.weekly;
  const pot = LEAGUE.entryFee * LEAGUE.players;
  const out = 38 * (w.first + w.second)
            + Object.values(PRIZES.season).reduce((a, b) => a + b, 0)
            + PRIZES.cup.winner + PRIZES.cup.runnerUp
            + PRIZES.highestGW;

  const item = (label, amount, note = '') => `
    <div class="stat">
      <div class="stat-label">${esc(label)}</div>
      <div class="stat-value">${money(amount)}</div>
      ${note ? `<div class="stat-meta">${esc(note)}</div>` : ''}
    </div>`;

  return `
    <div class="card" style="margin-bottom:16px">
      <div class="card-head"><h2>Where the money goes</h2>
        <span class="sub">${LEAGUE.players} managers × ${money(LEAGUE.entryFee)} = ${money(pot)}</span></div>
      <div class="card-body">
        <div class="grid grid-4">
          ${item('Weekly winner', w.first, 'every gameweek')}
          ${item('Weekly runner-up', w.second, 'every gameweek')}
          ${item('1st place', PRIZES.season[1], 'end of season')}
          ${item('2nd place', PRIZES.season[2], 'end of season')}
          ${item('3rd place', PRIZES.season[3], 'end of season')}
          ${item('4th place', PRIZES.season[4], 'end of season')}
          ${item('Cup winner', PRIZES.cup.winner, `runner-up ${money(PRIZES.cup.runnerUp)}`)}
          ${item('Highest gameweek', PRIZES.highestGW, 'single best score')}
        </div>
      </div>
    </div>

    <div class="card">
      <div class="card-head"><h2>The rules</h2></div>
      <div class="card-body">
        <ul style="list-style:none;display:grid;gap:12px;font-size:13.5px;color:var(--text-2)">
          <li><strong style="color:var(--text)">Scores are net of hits.</strong> A −4 comes off before the week is judged.</li>
          <li><strong style="color:var(--text)">Ties at the top merge the pot.</strong> Two managers level on top share ${money(w.first)} + ${money(w.second)} = ${money((w.first + w.second) / 2)} each, and nobody takes the runner-up prize.</li>
          <li><strong style="color:var(--text)">Ties for second split ${money(w.second)}</strong> evenly between them.</li>
          <li><strong style="color:var(--text)">Bottom of the week takes a loss.</strong> If several tie on the bottom score, they all take one.</li>
          <li><strong style="color:var(--text)">It balances.</strong> ${money(pot)} in, ${money(out)} out${out === pot ? '' : ` — currently ${money(pot - out)} adrift`}.</li>
        </ul>
      </div>
    </div>`;
}
