// ══════════════════════════════════════════════════════════════
//  Admin — who has actually been on the thing.
// ══════════════════════════════════════════════════════════════

import { esc, fmt, mgrCell, rowClass, pct, avatar } from './ui.js';
import { ago } from './api.js';
import { DEPARTED } from './config.js';

const dur = secs => {
  if (!secs) return '—';
  if (secs < 60) return `${secs}s`;
  const m = Math.round(secs / 60);
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  return `${h}h ${m % 60}m`;
};

const when = iso => {
  if (!iso) return '—';
  const d = new Date(iso);
  return d.toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
};

/* ── the PIN gate ─────────────────────────────────────────────── */
export function renderAdminLocked(error) {
  return `
    <div class="card" style="max-width:420px;margin:40px auto">
      <div class="card-body" style="text-align:center;padding:32px 28px">
        <div class="serif" style="font-size:26px;color:var(--brass);margin-bottom:6px">🔒</div>
        <h3 class="serif" style="font-size:18px;font-weight:600;margin-bottom:6px">Admin</h3>
        <p class="dim" style="font-size:13px;margin-bottom:20px">Enter the PIN to see who has been using the dashboard.</p>
        <input id="pinInput" type="password" inputmode="numeric" autocomplete="off" placeholder="PIN"
          style="width:100%;padding:11px 14px;background:var(--surface-3);border:1px solid var(--rule);
                 border-radius:var(--r);color:var(--text);text-align:center;letter-spacing:.4em;font-size:16px">
        ${error ? `<div class="neg" style="font-size:12.5px;margin-top:10px">${esc(error)}</div>` : ''}
        <button id="pinSubmit" style="width:100%;margin-top:14px;padding:11px;background:var(--brass);
          color:#14100A;font-weight:700;border-radius:var(--r);font-size:13.5px">Unlock</button>
      </div>
    </div>`;
}

/* ── the panel ────────────────────────────────────────────────── */
const seasonSwitch = (season, counts) => `
  <div style="display:flex;align-items:center;justify-content:space-between;gap:16px;margin-bottom:16px;flex-wrap:wrap">
    <div class="season-switch" id="adminSeasons">
      <button data-season="2026-27" aria-selected="${season === '2026-27'}">26/27 <span class="tab-badge">${counts['2026-27']}</span></button>
      <button data-season="2025-26" aria-selected="${season === '2025-26'}">25/26 <span class="tab-badge">${counts['2025-26']}</span></button>
      <button data-season="all"     aria-selected="${season === 'all'}">All time</button>
    </div>
    <span class="dim" style="font-size:11.5px">Nothing is deleted — the sheet keeps every session. This only chooses which to show.</span>
  </div>`;

export function renderAdmin(data, roster) {
  const { totals, people, recent, activity, season, counts } = data;

  // A season with no sessions yet — the usual state at the start
  if (!people.length) {
    return `
      ${seasonSwitch(season, counts)}
      <div class="card"><div class="card-body">
        <div class="empty">
          <div class="mark">○</div>
          <h3>No sessions logged for ${season === 'all' ? 'any season' : esc(season.replace('-', '/'))} yet</h3>
          <p>Tracking starts from the moment the 4th Edition went live. As soon as someone
             opens the dashboard and picks their name, they will appear here.</p>
        </div>
      </div></div>
      ${counts['2025-26'] ? `
      <div class="card">
        <div class="card-body" style="display:flex;gap:12px;align-items:center;font-size:13px">
          <span class="pill brass">Archive</span>
          <span>${counts['2025-26']} sessions from the 3rd Edition are still here — switch to <strong>25/26</strong> above.</span>
        </div>
      </div>` : ''}`;
  }

  // Anyone on this season's roster who has never logged in
  const seen = new Set(people.map(p => p.nick));
  const missing = roster.filter(m => !seen.has(m.nick));

  const maxVisits = Math.max(...people.map(p => p.visits), 1);
  const byNick = Object.fromEntries(roster.map(m => [m.nick, m]));

  const peopleRows = people.map((p, i) => {
    const m = byNick[p.nick];
    const gone = DEPARTED.includes(p.nick);
    return `
      <tr class="${rowClass(i, people.length, false)}">
        <td class="rank">${i + 1}</td>
        <td>${m ? mgrCell(m.display, m.team)
                : `<div class="mgr">${avatar(p.nick)}<div><div class="mgr-name">${esc(p.nick)}</div>
                   <div class="mgr-team">${gone ? 'left the league' : 'not on this season\'s roster'}</div></div></div>`}</td>
        <td class="right"><span class="total">${p.visits}</span></td>
        <td style="width:90px"><div class="meter"><span style="width:${pct(p.visits, maxVisits)}%"></span></div></td>
        <td class="right">${dur(p.seconds)}</td>
        <td class="right dim">${dur(p.avgSeconds)}</td>
        <td class="right dim">${fmt(p.clicks)}</td>
        <td class="right nowrap ${Date.now() - new Date(p.lastSeen) < 7 * 864e5 ? 'pos' : 'dim'}">${ago(p.lastSeen)}</td>
      </tr>`;
  }).join('');

  const recentRows = recent.map(s => `
    <tr>
      <td>${esc(byNick[s.nick]?.display || s.nick)}</td>
      <td class="dim nowrap">${when(s.loggedIn)}</td>
      <td class="right">${dur(s.seconds)}</td>
      <td class="right dim">${s.clicks}</td>
      <td class="center">${s.loggedOut ? '<span class="dim">closed</span>' : '<span class="pill">open</span>'}</td>
    </tr>`).join('');

  // 30-day sparkline
  const maxDay = Math.max(...activity.map(a => a.sessions), 1);
  const bars = activity.map(a => `
    <div title="${esc(a.day)} — ${a.sessions} session${a.sessions === 1 ? '' : 's'}, ${a.people} ${a.people === 1 ? 'person' : 'people'}"
      style="flex:1;min-width:5px;display:flex;flex-direction:column;justify-content:flex-end;height:56px">
      <div style="background:var(--brass);opacity:${0.35 + 0.65 * (a.sessions / maxDay)};
        height:${Math.max(6, pct(a.sessions, maxDay))}%;border-radius:2px"></div>
    </div>`).join('');

  return `
    ${seasonSwitch(season, counts)}

    <div class="grid grid-4" style="margin-bottom:16px">
      <div class="stat accent"><div class="stat-label">Total sessions</div>
        <div class="stat-value">${fmt(totals.sessions)}</div>
        <div class="stat-meta">${season === 'all' ? 'across both seasons'
          : season === '2026-27' ? 'this season' : 'the 3rd Edition'}</div></div>
      <div class="stat"><div class="stat-label">This week</div>
        <div class="stat-value">${fmt(totals.sessionsThisWeek)}</div>
        <div class="stat-meta">visits in the last 7 days</div></div>
      <div class="stat"><div class="stat-label">People</div>
        <div class="stat-value">${fmt(totals.people)}</div>
        <div class="stat-meta">${missing.length} never logged in</div></div>
      <div class="stat"><div class="stat-label">Time on site</div>
        <div class="stat-value">${Math.round(totals.totalMinutes / 60)}h</div>
        <div class="stat-meta">${fmt(totals.totalMinutes)} minutes all told</div></div>
    </div>

    ${activity.length ? `
    <div class="card" style="margin-bottom:16px">
      <div class="card-head"><h2>Last 30 days</h2><span class="sub">Sessions per day</span></div>
      <div class="card-body">
        <div style="display:flex;gap:3px;align-items:flex-end">${bars}</div>
      </div>
    </div>` : ''}

    <div class="card">
      <div class="card-head"><h2>Who's been on</h2><span class="sub">${
        season === 'all' ? 'All time' : season === '2026-27' ? '2026/27' : '2025/26'}</span></div>
      <div class="card-body flush"><div class="table-wrap"><table>
        <thead><tr>
          <th>#</th><th>Person</th><th class="right">Visits</th><th></th>
          <th class="right">Total time</th><th class="right">Avg visit</th>
          <th class="right">Clicks</th><th class="right">Last seen</th>
        </tr></thead>
        <tbody>${peopleRows}</tbody>
      </table></div></div>
    </div>

    ${missing.length && season !== '2025-26' ? `
    <div class="card">
      <div class="card-head"><h2>Never logged in</h2><span class="sub">On the 26/27 roster, yet to appear</span></div>
      <div class="card-body">
        <div class="grid grid-4">
          ${missing.map(m => `<div class="stat">
            <div class="stat-label">${esc(m.team || '')}</div>
            <div class="stat-value" style="font-size:17px">${esc(m.display)}</div>
            <div class="stat-meta">not seen once</div></div>`).join('')}
        </div>
      </div>
    </div>` : ''}

    <div class="card">
      <div class="card-head"><h2>Recent sessions</h2><span class="sub">Most recent ${recent.length}</span></div>
      <div class="card-body flush"><div class="table-wrap"><table>
        <thead><tr><th>Person</th><th>Logged in</th><th class="right">Duration</th>
          <th class="right">Clicks</th><th class="center">State</th></tr></thead>
        <tbody>${recentRows}</tbody>
      </table></div></div>
    </div>`;
}
