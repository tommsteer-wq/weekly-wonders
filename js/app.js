// ══════════════════════════════════════════════════════════════
//  WEEKLY WONDERS — 4th Edition
//  Boot, state, navigation, auto-refresh.
// ══════════════════════════════════════════════════════════════

import { LEAGUE, ROSTER, REFRESH, ADMIN } from './config.js';
import { fetchSeason, fetchLive, fetchCaptainHistory, lastSeason, lastLive, viewer, ago } from './api.js';
import { settleSeason } from './money.js';
import { $, $$, esc, html, initials, empty } from './ui.js';
import { renderLive, renderTable, renderMoney, renderCaptains, renderChips, renderExtras, renderPrizes } from './render.js';
import {
  renderArchiveTable, renderArchiveMoney, renderArchiveReports,
  renderArchiveChips, renderArchiveExtras, ARCHIVE_PLAYERS
} from './render-archive.js';

/* ─────────────────────────── STATE ──────────────────────────── */
const S = {
  season: '2026-27',
  tab: 'live',
  me: viewer.get(),
  managers: [],
  byNick: {}, byEntry: {},
  gameweek: { currentGW: null, lastFinishedGW: 0, lastCheckedGW: 0, isLive: false },
  settledUpTo: 0,
  live: null,
  captains: null,
  ledger: {},
  fetchedAt: null,
  error: null,
  loading: true
};

/* ── tab definitions per season ──────────────────────────────── */
const TABS_CURRENT = [
  { id: 'live',     label: 'Live' },
  { id: 'table',    label: 'Table' },
  { id: 'money',    label: 'Money' },
  { id: 'captains', label: 'Captains' },
  { id: 'chips',    label: 'Chips' },
  { id: 'extras',   label: 'Extras' },
  { id: 'prizes',   label: 'Prizes' }
];

// No "Live" and no season-overview nonsense on a finished season;
// it gets a Reports tab instead, which is where the 38 write-ups live.
const TABS_ARCHIVE = [
  { id: 'a-table',   label: 'Final table' },
  { id: 'a-money',   label: 'Money' },
  { id: 'a-reports', label: 'Reports', badge: '38' },
  { id: 'a-chips',   label: 'Chips' },
  { id: 'a-extras',  label: 'Extras' }
];

const tabsFor = () => S.season === '2026-27' ? TABS_CURRENT : TABS_ARCHIVE;

/* ─────────────────────── DATA ASSEMBLY ──────────────────────── */
function decorate(managers) {
  S.byNick = {}; S.byEntry = {};
  S.managers = managers.map(m => {
    const r = ROSTER[m.entry];
    const nick = r?.nick || m.name.split(' ')[0].toUpperCase();
    const display = r?.display || m.name;
    const d = { ...m, nick, display, note: r?.note || null };
    S.byNick[nick] = d;
    S.byEntry[m.entry] = d;
    return d;
  });
}

function recomputeMoney() {
  const nicks = S.managers.map(m => m.nick);
  const gwPts = Object.fromEntries(S.managers.map(m => [m.nick, m.pts]));

  // A gameweek only pays out once FPL has checked the data (bonus
  // applied, score final). Anything after that is provisional and
  // belongs to the live tab, not the ledger.
  S.settledUpTo = S.gameweek.lastCheckedGW || 0;

  const { ledger } = settleSeason(nicks, gwPts, {
    upToGW: S.settledUpTo,
    includeHighestGW: false   // only awarded at the end of the season
  });
  S.ledger = ledger;
}

/* ──────────────────────────── LOAD ──────────────────────────── */
async function load({ silent = false } = {}) {
  if (!silent) { S.loading = true; paint(); }
  S.error = null;

  try {
    const season = await fetchSeason();
    S.gameweek = season.gameweek;
    S.fetchedAt = season.fetchedAt;
    decorate(season.managers);
    recomputeMoney();
  } catch (err) {
    // fall back to whatever we last saw rather than showing nothing
    const cached = lastSeason();
    if (cached) {
      S.gameweek = cached.data.gameweek;
      S.fetchedAt = cached.data.fetchedAt;
      decorate(cached.data.managers);
      recomputeMoney();
      S.error = `Could not reach the FPL API — showing data from ${ago(cached.data.fetchedAt)}.`;
    } else {
      S.error = err.message;
    }
  }

  S.loading = false;
  paint();

  // Live data second, so the table paints fast
  if (S.gameweek.currentGW) loadLive();
  if (S.tab === 'captains') loadCaptains();
}

async function loadLive() {
  try {
    const live = await fetchLive();
    live.managers.forEach(m => {
      const d = S.byEntry[m.entry];
      m.nick = d?.nick || m.name;
      m.display = d?.display || m.name;
    });
    S.live = live;
  } catch {
    const cached = lastLive();
    if (cached) S.live = cached.data;
  }
  paint();
}

let captainsLoading = false;
async function loadCaptains() {
  if (captainsLoading) return;
  const upTo = S.gameweek.currentGW || S.gameweek.lastFinishedGW;
  if (!upTo) return;
  captainsLoading = true;
  try {
    S.captains = await fetchCaptainHistory(upTo, (done, total) => {
      const el = $('#captainProgress');
      if (el && total) el.textContent = `Loading gameweek ${done} of ${total}…`;
    });
  } catch (err) {
    console.warn(err);
  }
  captainsLoading = false;
  paint();
}

/* ─────────────────────────── PAINT ──────────────────────────── */
function paint() {
  paintHeader();
  paintTabs();
  paintBody();
}

function paintHeader() {
  const gw = S.gameweek;
  const pill = $('#livePill');
  if (pill) {
    const isLive = S.live?.isLive || gw.isLive;
    pill.className = `live-pill${isLive ? ' is-live' : ''}`;
    const label = S.season !== '2026-27'
      ? 'Season complete'
      : isLive ? `GW${gw.currentGW} in play`
      : gw.lastFinishedGW ? `GW${gw.lastFinishedGW} final`
      : 'Pre-season';
    pill.innerHTML = `<span class="live-dot"></span><span class="live-text">${esc(label)}</span>`;
  }

  const upd = $('#updated');
  if (upd) upd.textContent = S.fetchedAt ? `Updated ${ago(S.fetchedAt)}` : '';

  $$('.season-switch button').forEach(b =>
    b.setAttribute('aria-selected', String(b.dataset.season === S.season)));

  const chip = $('#viewerChip');
  if (chip) {
    const me = S.me ? (S.byNick[S.me]?.display || S.me) : null;
    chip.innerHTML = me
      ? `<span class="avatar">${esc(initials(me))}</span><span class="label">${esc(me)}</span>`
      : `<span class="avatar">?</span><span class="label">Who are you?</span>`;
  }
}

function paintTabs() {
  const bar = $('#tabbar');
  const tabs = tabsFor();
  if (!tabs.some(t => t.id === S.tab)) S.tab = tabs[0].id;

  html(bar, tabs.map(t => `
    <button data-tab="${t.id}" aria-selected="${t.id === S.tab}">
      ${esc(t.label)}${t.badge ? `<span class="tab-badge">${esc(t.badge)}</span>` : ''}
    </button>`).join('') +
    (S.me === 'STEER' ? `<button data-tab="admin" aria-selected="${S.tab === 'admin'}">Admin</button>` : ''));
}

function paintBody() {
  const main = $('#main');
  const banner = S.error
    ? `<div class="card" style="margin-bottom:16px;border-color:rgba(193,85,79,.4)">
         <div class="card-body" style="display:flex;gap:12px;align-items:center;font-size:13px">
           <span class="pill neg">Offline</span><span>${esc(S.error)}</span>
         </div></div>` : '';

  if (S.loading && !S.managers.length) {
    html(main, banner + loadingState());
    return;
  }

  let body = '';
  try {
    switch (S.tab) {
      case 'live':      body = renderLive(S); break;
      case 'table':     body = renderTable(S); break;
      case 'money':     body = renderMoney(S); break;
      case 'captains':  body = S.captains ? renderCaptains(S) : captainsLoadingState(); break;
      case 'chips':     body = renderChips(S); break;
      case 'extras':    body = renderExtras(S); break;
      case 'prizes':    body = renderPrizes(); break;

      case 'a-table':   body = renderArchiveTable(S.me); break;
      case 'a-money':   body = renderArchiveMoney(S.me); break;
      case 'a-reports': body = renderArchiveReports(); break;
      case 'a-chips':   body = renderArchiveChips(S.me); break;
      case 'a-extras':  body = renderArchiveExtras(S.me); break;

      case 'admin':     body = renderAdmin(); break;
      default:          body = empty('Nothing here', 'Pick a tab above.');
    }
  } catch (err) {
    console.error(err);
    body = empty('Something broke rendering this tab', String(err.message), '!');
  }

  html(main, banner + body);
}

const loadingState = () => `
  <div class="grid grid-4" style="margin-bottom:16px">
    ${Array.from({ length: 4 }, () => `
      <div class="stat"><div class="skel" style="width:50%;height:9px"></div>
        <div class="skel" style="width:70%;height:24px;margin-top:10px"></div>
        <div class="skel" style="width:60%;height:9px;margin-top:8px"></div></div>`).join('')}
  </div>
  <div class="card"><div class="card-body">
    ${Array.from({ length: 8 }, () => `<div class="skel" style="height:34px;margin-bottom:8px"></div>`).join('')}
  </div></div>`;

const captainsLoadingState = () => `
  <div class="card"><div class="card-body">
    <div class="empty">
      <div class="mark">©</div>
      <h3>Gathering captain history</h3>
      <p id="captainProgress">Reading each gameweek's picks. Finished weeks are cached, so this only happens once.</p>
    </div>
  </div></div>`;

function renderAdmin() {
  return `
    <div class="card">
      <div class="card-head"><h2>Admin</h2><span class="sub">League ${LEAGUE.id}</span></div>
      <div class="card-body">
        <div class="grid grid-3">
          <div class="stat"><div class="stat-label">League ID</div><div class="stat-value" style="font-size:20px">${LEAGUE.id}</div>
            <div class="stat-meta">invite code ${esc(LEAGUE.inviteCode)}</div></div>
          <div class="stat"><div class="stat-label">Managers</div><div class="stat-value">${S.managers.length}</div>
            <div class="stat-meta">expected ${LEAGUE.players}</div></div>
          <div class="stat"><div class="stat-label">Data age</div><div class="stat-value" style="font-size:20px">${ago(S.fetchedAt)}</div>
            <div class="stat-meta">edge-cached response</div></div>
        </div>
        <p class="dim" style="margin-top:16px;font-size:12.5px">
          Session tracking is not wired into this build yet. Say the word and I will add it back,
          ideally on something sturdier than a Google Apps Script with the PIN in the page source.
        </p>
      </div>
    </div>`;
}

/* ────────────────────────── WELCOME ─────────────────────────── */
function showWelcome() {
  const grid = $('#whoGrid');
  const people = S.managers.length
    ? S.managers.map(m => ({ nick: m.nick, name: m.display, team: m.team }))
    : ARCHIVE_PLAYERS.map(p => ({ nick: p.nick, name: p.name, team: p.team }));

  html(grid, people
    .sort((a, b) => a.name.localeCompare(b.name))
    .map(p => `<button class="who" data-nick="${esc(p.nick)}">
        <div class="n">${esc(p.name)}</div><div class="t">${esc(p.team)}</div></button>`).join('')
    + `<button class="who guest" data-nick=""><div class="n">Just looking</div><div class="t">no highlight</div></button>`);

  $('#welcome').classList.remove('hidden');
}

function pickViewer(nick) {
  S.me = nick || null;
  if (nick) viewer.set(nick); else viewer.clear();
  $('#welcome').classList.add('hidden');
  paint();
}

/* ─────────────────────── AUTO REFRESH ───────────────────────── */
let timer = null;
function scheduleRefresh() {
  clearTimeout(timer);
  if (S.season !== '2026-27') return;                 // archive never changes
  const live = S.live?.isLive || S.gameweek.isLive;
  const wait = live ? REFRESH.liveMs : REFRESH.idleMs;
  timer = setTimeout(async () => {
    if (!document.hidden) {
      await load({ silent: true });
      if (S.tab === 'captains') loadCaptains();
    }
    scheduleRefresh();
  }, wait);
}

// Catch up immediately when the tab comes back into focus
document.addEventListener('visibilitychange', () => {
  if (!document.hidden && S.season === '2026-27') {
    const age = S.fetchedAt ? Date.now() - new Date(S.fetchedAt).getTime() : Infinity;
    if (age > REFRESH.liveMs) load({ silent: true });
  }
});

/* ─────────────────────────── EVENTS ─────────────────────────── */
document.addEventListener('click', e => {
  const tabBtn = e.target.closest('#tabbar button');
  if (tabBtn) {
    S.tab = tabBtn.dataset.tab;
    paintTabs(); paintBody();
    if (S.tab === 'captains' && !S.captains) loadCaptains();
    window.scrollTo({ top: 0, behavior: 'smooth' });
    return;
  }

  const seasonBtn = e.target.closest('.season-switch button');
  if (seasonBtn) {
    S.season = seasonBtn.dataset.season;
    S.tab = tabsFor()[0].id;
    paint();
    scheduleRefresh();
    return;
  }

  if (e.target.closest('#viewerChip')) { showWelcome(); return; }

  const who = e.target.closest('.who');
  if (who) { pickViewer(who.dataset.nick); return; }

  if (e.target.closest('#refreshBtn')) {
    const btn = $('#refreshBtn');
    btn.classList.add('spinning');
    load({ silent: true })
      .then(() => S.tab === 'captains' ? loadCaptains() : null)
      .finally(() => btn.classList.remove('spinning'));
  }
});

/* ──────────────────────────── BOOT ──────────────────────────── */
async function boot() {
  $('#year').textContent = new Date().getFullYear();
  paintHeader();
  await load();
  if (!S.me) showWelcome();
  scheduleRefresh();
}

boot();
