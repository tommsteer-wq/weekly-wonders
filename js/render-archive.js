// ══════════════════════════════════════════════════════════════
//  2025/26 archive.
//  The season is settled, so the money here is the RECORDED
//  figure, not a recomputed one. This is the historical record.
// ══════════════════════════════════════════════════════════════

import { SEASON_2526 as S } from './data-2526.js';
import { esc, fmt, money, mgrCell, rowClass, stats, pct } from './ui.js';

const byNick = Object.fromEntries(S.players.map(p => [p.nick, p]));

export function renderArchiveTable(me) {
  const leader = S.standings[0].total;
  const rows = S.standings.map((p, i) => `
    <tr class="${rowClass(i, S.standings.length, p.nick === me)}">
      <td class="rank">${p.rank}</td>
      <td>${mgrCell(p.name, p.team)}</td>
      <td class="right"><span class="total">${fmt(p.total)}</span></td>
      <td class="right dim">${i === 0 ? '—' : '−' + fmt(leader - p.total)}</td>
      <td class="right dim">${fmt(Math.max(...S.gwPts[p.nick]))}</td>
      <td class="right dim">${(S.gwPts[p.nick].reduce((a, b) => a + b, 0) / 38).toFixed(1)}</td>
    </tr>`).join('');

  const allPts = Object.values(S.gwPts).flat();
  const best = Math.max(...allPts);
  const bestNick = Object.entries(S.gwPts).find(([, v]) => v.includes(best))?.[0];
  const bestGW = S.gwPts[bestNick].indexOf(best) + 1;

  return `
    <div class="card" style="margin-bottom:16px;background:linear-gradient(135deg,rgba(201,162,39,.07),transparent 60%)">
      <div class="card-body" style="text-align:center;padding:28px">
        <div class="eyebrow">Champion · 2025/26</div>
        <div class="serif" style="font-size:34px;font-weight:600;margin:8px 0 4px;letter-spacing:-.02em">${esc(S.standings[0].name)}</div>
        <div class="dim">${esc(S.standings[0].team)} · ${fmt(S.standings[0].total)} points · won by ${S.standings[0].total - S.standings[1].total}</div>
      </div>
    </div>

    <div class="grid grid-4" style="margin-bottom:16px">
      <div class="stat accent"><div class="stat-label">Best gameweek</div>
        <div class="stat-value">${best}</div>
        <div class="stat-meta">${esc(byNick[bestNick]?.name || bestNick)}, GW${bestGW}</div></div>
      <div class="stat"><div class="stat-label">Season average</div>
        <div class="stat-value">${(allPts.reduce((a, b) => a + b, 0) / allPts.length).toFixed(1)}</div>
        <div class="stat-meta">across 14 managers</div></div>
      <div class="stat"><div class="stat-label">Managers</div>
        <div class="stat-value">14</div><div class="stat-meta">38 gameweeks played</div></div>
      <div class="stat"><div class="stat-label">Prize pot</div>
        <div class="stat-value">£1,064</div><div class="stat-meta">14 × £76 · settled</div></div>
    </div>

    <div class="card">
      <div class="card-head"><h2>Final table</h2><span class="sub">After gameweek 38</span></div>
      <div class="card-body flush"><div class="table-wrap"><table>
        <thead><tr><th>#</th><th>Manager</th><th class="right">Total</th>
          <th class="right">Gap</th><th class="right">Best GW</th><th class="right">Avg</th></tr></thead>
        <tbody>${rows}</tbody>
      </table></div></div>
    </div>`;
}

export function renderArchiveMoney(me) {
  const table = Object.entries(S.money)
    .map(([nick, d]) => ({ nick, ...d, p: byNick[nick] }))
    .sort((a, b) => b.winnings - a.winnings);
  const maxWin = Math.max(...table.map(t => t.winnings));

  const rows = table.map((t, i) => `
    <tr class="${rowClass(i, table.length, t.nick === me)}">
      <td class="rank">${i + 1}</td>
      <td>${mgrCell(t.p?.name || t.nick, t.p?.team)}</td>
      <td class="right"><span class="total pos">${money(t.winnings)}</span></td>
      <td style="width:110px"><div class="meter pos"><span style="width:${pct(t.winnings, maxWin)}%"></span></div></td>
      <td class="right ${t.winnings - 76 >= 0 ? 'pos' : 'neg'}">${money(t.winnings - 76)}</td>
    </tr>`).join('');

  const losers = table.slice().sort((a, b) => b.losses - a.losses);
  const maxLoss = Math.max(...losers.map(l => l.losses), 1);

  return `
    <div class="grid grid-2">
      <div class="card">
        <div class="card-head"><h2>Final money league</h2><span class="sub">Settled · as recorded</span></div>
        <div class="card-body flush"><div class="table-wrap"><table>
          <thead><tr><th>#</th><th>Manager</th><th class="right">Won</th><th></th><th class="right">vs £76 fee</th></tr></thead>
          <tbody>${rows}</tbody>
        </table></div></div>
      </div>
      <div class="card">
        <div class="card-head"><h2>Losers league</h2><span class="sub">Times finishing bottom</span></div>
        <div class="card-body flush"><div class="table-wrap"><table>
          <thead><tr><th>#</th><th>Manager</th><th class="right">Losses</th><th></th></tr></thead>
          <tbody>${losers.map((l, i) => `
            <tr class="${l.nick === me ? 'is-me' : ''}">
              <td class="rank">${i + 1}</td>
              <td>${mgrCell(l.p?.name || l.nick, l.p?.team)}</td>
              <td class="right"><span class="total ${l.losses ? 'neg' : 'dim'}">${l.losses}</span></td>
              <td style="width:110px"><div class="meter neg"><span style="width:${pct(l.losses, maxLoss)}%"></span></div></td>
            </tr>`).join('')}
          </tbody>
        </table></div></div>
      </div>
    </div>`;
}

export function renderArchiveReports() {
  const cards = S.reports.map(r => `
    <details class="card" style="margin-bottom:10px">
      <summary style="padding:14px 18px;cursor:pointer;display:flex;align-items:center;gap:14px;list-style:none">
        <span class="pill brass" style="min-width:52px;text-align:center">GW${r.gw}</span>
        <span style="flex:1;min-width:0">
          <span style="font-weight:600">${esc(r.winner)}</span>
          <span class="dim"> ${r.winnerPts} pts</span>
          <span class="dim" style="margin-left:10px">· bottom: ${esc(r.loser)} ${r.loserPts}</span>
        </span>
        <span class="dim nowrap" style="font-size:11.5px">avg ${r.avg}</span>
      </summary>
      <div style="padding:0 18px 18px;border-top:1px solid var(--rule-soft);margin-top:2px;padding-top:14px">
        <p style="margin-bottom:12px;color:var(--text-2);line-height:1.65">${esc(r.mention)}</p>
        <div class="grid grid-3" style="gap:10px">
          <div><div class="eyebrow">Winner</div><div style="margin-top:4px">${esc(r.winner)} — ${r.winnerPts}</div></div>
          <div><div class="eyebrow">Runner-up</div><div style="margin-top:4px">${esc(r.runnerUp)} — ${r.runnerUpPts}</div></div>
          <div><div class="eyebrow">Bottom</div><div style="margin-top:4px">${esc(r.loser)} — ${r.loserPts}</div></div>
        </div>
        ${r.chips ? `<div style="margin-top:14px"><div class="eyebrow">Chips played</div>
          <div style="margin-top:4px;color:var(--text-2);font-size:12.5px">${esc(r.chips)}</div></div>` : ''}
        ${r.fact ? `<div style="margin-top:14px;padding:12px 14px;background:var(--surface-2);border-left:2px solid var(--brass);border-radius:0 var(--r-sm) var(--r-sm) 0">
          <div class="eyebrow">Stat of the week</div>
          <div style="margin-top:4px;color:var(--text-2);font-size:12.5px">${esc(r.fact)}</div></div>` : ''}
      </div>
    </details>`).join('');

  return `
    <div class="section-head">
      <h2>Every gameweek, 2025/26</h2>
      <p>${S.reports.length} reports</p>
    </div>
    ${cards}`;
}

export function renderArchiveChips(me) {
  const order = [
    ['wc1', 'wc2', 'Wildcard'],
    ['bb1', 'bb2', 'Bench Boost'],
    ['tc1', 'tc2', 'Triple Captain'],
    ['fh1', 'fh2', 'Free Hit']
  ];
  const rows = S.standings.map(p => {
    const c = S.chips[p.nick] || {};
    const cells = order.map(([a, b]) =>
      `<td class="chip-cell">${[a, b].map(k => c[k]
        ? `<span class="chip-used">GW${c[k]}</span>`
        : '<span class="chip-free">—</span>').join(' ')}</td>`).join('');
    return `<tr class="${p.nick === me ? 'is-me' : ''}">
      <td>${mgrCell(p.name, p.team)}</td>${cells}</tr>`;
  }).join('');

  return `
    <div class="card">
      <div class="card-head"><h2>Chips, 2025/26</h2>
        <span class="sub">Two of each — FPL doubled them up that season</span></div>
      <div class="card-body flush"><div class="table-wrap"><table>
        <thead><tr><th>Manager</th>${order.map(o => `<th class="center">${o[2]}</th>`).join('')}</tr></thead>
        <tbody>${rows}</tbody>
      </table></div></div>
    </div>`;
}

export function renderArchiveExtras(me) {
  const cons = S.players.map(p => ({ p, ...stats(S.gwPts[p.nick]) })).sort((a, b) => a.sd - b.sd);
  const best = S.players.flatMap(p => S.gwPts[p.nick].map((v, i) => ({ p, v, gw: i + 1 })))
    .sort((a, b) => b.v - a.v).slice(0, 10);

  return `
    <div class="grid grid-2">
      <div class="card">
        <div class="card-head"><h2>Most consistent</h2><span class="sub">Lowest swing across 38 weeks</span></div>
        <div class="card-body flush"><div class="table-wrap"><table>
          <thead><tr><th>#</th><th>Manager</th><th class="right">Avg</th><th class="right">Swing</th><th class="right">Range</th></tr></thead>
          <tbody>${cons.map((c, i) => `
            <tr class="${c.p.nick === me ? 'is-me' : ''}">
              <td class="rank">${i + 1}</td><td>${mgrCell(c.p.name, c.p.team)}</td>
              <td class="right">${c.mean.toFixed(1)}</td>
              <td class="right"><span class="total">±${c.sd.toFixed(1)}</span></td>
              <td class="right dim">${c.min}–${c.max}</td>
            </tr>`).join('')}</tbody>
        </table></div></div>
      </div>
      <div class="card">
        <div class="card-head"><h2>Biggest gameweeks</h2><span class="sub">Best single scores of 25/26</span></div>
        <div class="card-body flush"><div class="table-wrap"><table>
          <thead><tr><th>#</th><th>Manager</th><th class="center">GW</th><th class="right">Points</th></tr></thead>
          <tbody>${best.map((b, i) => `
            <tr class="${b.p.nick === me ? 'is-me' : ''}">
              <td class="rank">${i + 1}</td><td>${mgrCell(b.p.name, b.p.team)}</td>
              <td class="center dim">GW${b.gw}</td>
              <td class="right"><span class="total ${i === 0 ? 'pos' : ''}">${b.v}</span></td>
            </tr>`).join('')}</tbody>
        </table></div></div>
      </div>
    </div>`;
}

export const ARCHIVE_PLAYERS = S.players;
