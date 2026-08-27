// ══════════════════════════════════════════════════════════════
//  Client data layer.
//  Talks to our own /api/* routes (never to FPL directly), and
//  keeps finished-gameweek captain data in localStorage so the
//  captains tab stays cheap all the way to GW38.
// ══════════════════════════════════════════════════════════════

import { LEAGUE } from './config.js';

const CACHE_VERSION = 'ww4';
const key = k => `${CACHE_VERSION}:${LEAGUE.id}:${k}`;

/* ── tiny localStorage wrapper that never throws ─────────────── */
const store = {
  get(k) {
    try { const v = localStorage.getItem(key(k)); return v ? JSON.parse(v) : null; }
    catch { return null; }
  },
  set(k, v) {
    try { localStorage.setItem(key(k), JSON.stringify(v)); return true; }
    catch { return false; }            // private mode, quota, blocked
  },
  del(k) { try { localStorage.removeItem(key(k)); } catch {} }
};

async function getJSON(url) {
  const res = await fetch(url, { headers: { Accept: 'application/json' } });
  const body = await res.json().catch(() => null);
  if (!res.ok || !body?.ok) {
    throw new Error(body?.error || `Request failed (${res.status})`);
  }
  return body;
}

/* ── season: standings + full history ────────────────────────── */
export async function fetchSeason() {
  const data = await getJSON(`/api/season?league=${LEAGUE.id}`);
  store.set('season:last', { at: Date.now(), data });
  return data;
}

/** Last good response, so a failed refresh degrades instead of blanking. */
export function lastSeason() {
  return store.get('season:last');
}

/* ── live gameweek ───────────────────────────────────────────── */
export async function fetchLive(gw) {
  const q = gw ? `&gw=${gw}` : '';
  const data = await getJSON(`/api/live?league=${LEAGUE.id}${q}`);
  store.set('live:last', { at: Date.now(), data });
  return data;
}

export function lastLive() {
  return store.get('live:last');
}

/* ── captains, accumulated across the season ─────────────────── */
/**
 * Returns every captain row from GW1 to `upToGW`.
 * Finished gameweeks are read from localStorage; only the
 * in-progress one is ever re-fetched.
 */
export async function fetchCaptainHistory(upToGW, onProgress) {
  const cached = store.get('captains') || { rows: {}, final: {} };
  const needed = [];

  for (let gw = 1; gw <= upToGW; gw++) {
    if (!cached.final[gw]) needed.push(gw);       // not final yet, or never fetched
  }

  // Request in chunks the serverless function can handle in time
  const CHUNK = 6;
  const chunks = [];
  for (let i = 0; i < needed.length; i += CHUNK) chunks.push(needed.slice(i, i + CHUNK));

  let done = 0;
  for (const chunk of chunks) {
    onProgress?.(done, needed.length);
    try {
      const res = await getJSON(`/api/captains?league=${LEAGUE.id}&gws=${chunk.join(',')}`);
      for (const gw of chunk) {
        cached.rows[gw] = res.rows.filter(r => r.gw === gw);
        cached.final[gw] = !!res.final[gw];
      }
    } catch (err) {
      // keep whatever we already had; surface the gap rather than dying
      console.warn('captain chunk failed', chunk, err);
    }
    done += chunk.length;
  }
  onProgress?.(needed.length, needed.length);

  store.set('captains', cached);

  const rows = [];
  for (let gw = 1; gw <= upToGW; gw++) rows.push(...(cached.rows[gw] || []));
  return { rows, final: cached.final };
}

export function clearCaptainCache() { store.del('captains'); }

/* ── who is viewing ──────────────────────────────────────────── */
export const viewer = {
  get()  { try { return localStorage.getItem('ww4:viewer'); } catch { return null; } },
  set(n) { try { localStorage.setItem('ww4:viewer', n); } catch {} },
  clear(){ try { localStorage.removeItem('ww4:viewer'); } catch {} }
};

/* ── relative time ───────────────────────────────────────────── */
export function ago(iso) {
  if (!iso) return '—';
  const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 45) return 'just now';
  if (s < 90) return 'a minute ago';
  if (s < 3600) return `${Math.round(s / 60)} min ago`;
  if (s < 7200) return 'an hour ago';
  if (s < 86400) return `${Math.round(s / 3600)} hours ago`;
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}
