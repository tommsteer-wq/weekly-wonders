// ══════════════════════════════════════════════════════════════
//  Shared FPL helpers (underscore prefix = not a public route)
//  Runs server-side on Vercel, so there is no CORS problem and
//  no third-party proxy in the chain.
// ══════════════════════════════════════════════════════════════

const BASE = 'https://fantasy.premierleague.com/api';

const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (compatible; WeeklyWonders/4.0; +https://weekly-wonders.vercel.app)',
  'Accept': 'application/json'
};

/** Fetch one FPL endpoint with a timeout and one retry. */
export async function fpl(path, { timeout = 9000, retries = 1 } = {}) {
  for (let attempt = 0; attempt <= retries; attempt++) {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), timeout);
    try {
      const res = await fetch(`${BASE}${path}`, { headers: HEADERS, signal: ctrl.signal });
      clearTimeout(timer);
      if (res.status === 404) return null;                 // dead entry / no picks yet
      if (!res.ok) throw new Error(`FPL ${res.status} on ${path}`);
      return await res.json();
    } catch (err) {
      clearTimeout(timer);
      if (attempt === retries) throw err;
      await new Promise(r => setTimeout(r, 350 * (attempt + 1)));
    }
  }
}

/** Run tasks with bounded concurrency so we don't hammer the FPL API. */
export async function pool(items, limit, worker) {
  const out = new Array(items.length);
  let cursor = 0;
  const runners = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (cursor < items.length) {
      const i = cursor++;
      try { out[i] = await worker(items[i], i); }
      catch { out[i] = null; }
    }
  });
  await Promise.all(runners);
  return out;
}

/** Work out where we are in the season from bootstrap events. */
export function gameweekState(events) {
  const current = events.find(e => e.is_current) || null;
  const next    = events.find(e => e.is_next) || null;
  const finished = events.filter(e => e.finished).map(e => e.id);

  // data_checked means bonus is applied and the score will not move
  // again. Money is only settled off checked gameweeks.
  const checked = events.filter(e => e.data_checked).map(e => e.id);

  // "Live" = current GW has kicked off but isn't bonus-checked yet.
  const isLive = !!current && !current.data_checked;

  return {
    currentGW:  current?.id ?? null,
    nextGW:     next?.id ?? null,
    isLive,
    finishedGWs: finished,
    lastFinishedGW: finished.length ? Math.max(...finished) : 0,
    checkedGWs: checked,
    lastCheckedGW: checked.length ? Math.max(...checked) : 0,
    nextDeadline: next?.deadline_time ?? null,
    currentAverage: current?.average_entry_score ?? null,
    currentHighest: current?.highest_score ?? null
  };
}

/** Cache-Control for Vercel's edge. Live data is short-lived. */
export function setCache(res, { seconds, swr = seconds * 4 }) {
  res.setHeader('Cache-Control', `public, s-maxage=${seconds}, stale-while-revalidate=${swr}`);
  res.setHeader('CDN-Cache-Control', `public, s-maxage=${seconds}`);
}

export function fail(res, err, status = 502) {
  res.status(status).json({
    ok: false,
    error: String(err?.message || err),
    hint: 'The FPL API may be down or mid-update. The dashboard will show cached data.'
  });
}
