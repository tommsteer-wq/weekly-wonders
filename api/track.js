// ══════════════════════════════════════════════════════════════
//  POST /api/track   { action, id, nick, time, duration, clicks, loggedOut }
//
//  Records a viewing session. The browser talks to us, and we talk
//  to the Google Sheet — so the Apps Script URL never appears in
//  the page source the way it did last season.
// ══════════════════════════════════════════════════════════════

import { TRACKING_URL } from './_secrets.js';

export const config = { maxDuration: 10 };

const ALLOWED = new Set(['start', 'update']);

export default async function handler(req, res) {
  // sendBeacon posts JSON; a plain GET is accepted too for debugging
  const src = req.method === 'POST' ? (req.body || {}) : (req.query || {});
  const body = typeof src === 'string' ? safeParse(src) : src;

  const action = String(body.action || '');
  if (!ALLOWED.has(action)) {
    return res.status(400).json({ ok: false, error: 'bad action' });
  }

  // Whitelist and bound every field — this ends up in a spreadsheet
  const params = new URLSearchParams({ action });
  const put = (k, v, max) => {
    if (v === undefined || v === null || v === '') return;
    params.set(k, String(v).slice(0, max));
  };
  put('id',        body.id,   60);
  put('nick',      body.nick, 20);
  put('time',      body.time, 30);
  put('loggedOut', body.loggedOut, 30);
  params.set('duration', String(Math.max(0, Math.min(86400, parseInt(body.duration, 10) || 0))));
  params.set('clicks',   String(Math.max(0, Math.min(100000, parseInt(body.clicks, 10) || 0))));

  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 8000);
    await fetch(`${TRACKING_URL}?${params}`, { redirect: 'follow', signal: ctrl.signal });
    clearTimeout(t);
    res.setHeader('Cache-Control', 'no-store');
    return res.status(200).json({ ok: true });
  } catch (err) {
    // Tracking must never break the page
    res.setHeader('Cache-Control', 'no-store');
    return res.status(200).json({ ok: false, error: String(err.message) });
  }
}

function safeParse(s) { try { return JSON.parse(s); } catch { return {}; } }
