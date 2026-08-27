// ══════════════════════════════════════════════════════════════
//  GET /api/sessions?pin=xxxx
//
//  Reads the session log and returns it already aggregated.
//  The PIN is checked HERE, on the server — last season it was a
//  string in the page source that hid a tab from the honest.
// ══════════════════════════════════════════════════════════════

import { TRACKING_URL, pinMatches, usingEnv } from './_secrets.js';

export const config = { maxDuration: 20 };

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');

  if (!pinMatches(req.query.pin)) {
    // deliberately slow and vague
    await new Promise(r => setTimeout(r, 600));
    return res.status(401).json({ ok: false, error: 'Wrong PIN' });
  }

  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 15000);
    const r = await fetch(`${TRACKING_URL}?action=read`, { redirect: 'follow', signal: ctrl.signal });
    clearTimeout(t);

    const raw = await r.json();
    const rows = (Array.isArray(raw) ? raw : raw.rows || [])
      // the sheet returns its own header row — drop anything that
      // isn't a real ISO timestamp in the "logged in" column
      .filter(x => Array.isArray(x) && /^\d{4}-\d{2}-\d{2}T/.test(String(x[2])))
      // and drop rows written by connectivity tests
      .filter(x => !/^TESTPING/i.test(String(x[1] || '')))
      .map(([id, nick, loggedIn, loggedOut, duration, clicks]) => ({
        id: String(id),
        nick: String(nick || '').toUpperCase(),
        loggedIn,
        loggedOut: loggedOut || null,
        seconds: Math.max(0, parseInt(duration, 10) || 0),
        clicks: Math.max(0, parseInt(clicks, 10) || 0)
      }))
      .sort((a, b) => new Date(b.loggedIn) - new Date(a.loggedIn));

    // ── per person ──
    const people = {};
    for (const s of rows) {
      const p = people[s.nick] = people[s.nick] || {
        nick: s.nick, visits: 0, seconds: 0, clicks: 0,
        firstSeen: s.loggedIn, lastSeen: s.loggedIn
      };
      p.visits++;
      p.seconds += s.seconds;
      p.clicks += s.clicks;
      if (s.loggedIn > p.lastSeen)  p.lastSeen  = s.loggedIn;
      if (s.loggedIn < p.firstSeen) p.firstSeen = s.loggedIn;
    }
    for (const p of Object.values(people)) {
      p.avgSeconds = p.visits ? Math.round(p.seconds / p.visits) : 0;
    }

    // ── activity by day, last 30 ──
    const byDay = {};
    const cutoff = Date.now() - 30 * 864e5;
    for (const s of rows) {
      const t = new Date(s.loggedIn).getTime();
      if (t < cutoff) continue;
      const day = s.loggedIn.slice(0, 10);
      byDay[day] = byDay[day] || { day, sessions: 0, people: new Set() };
      byDay[day].sessions++;
      byDay[day].people.add(s.nick);
    }
    const activity = Object.values(byDay)
      .map(d => ({ day: d.day, sessions: d.sessions, people: d.people.size }))
      .sort((a, b) => a.day.localeCompare(b.day));

    const weekAgo = new Date(Date.now() - 7 * 864e5).toISOString();

    return res.status(200).json({
      ok: true,
      fetchedAt: new Date().toISOString(),
      secured: usingEnv.pin && usingEnv.trackingUrl,
      totals: {
        sessions: rows.length,
        people: Object.keys(people).length,
        sessionsThisWeek: rows.filter(s => s.loggedIn >= weekAgo).length,
        totalMinutes: Math.round(rows.reduce((a, s) => a + s.seconds, 0) / 60)
      },
      people: Object.values(people).sort((a, b) => b.visits - a.visits),
      activity,
      recent: rows.slice(0, 40)
    });
  } catch (err) {
    return res.status(502).json({ ok: false, error: String(err.message) });
  }
}
