// ══════════════════════════════════════════════════════════════
//  GET /api/captains?league=<id>&gws=1,2,3
//  Captain picks for a batch of gameweeks.
//
//  Deliberately chunked: a finished gameweek's captain never
//  changes, so the client caches each one forever in localStorage
//  and only ever re-requests the gameweek in progress. Without
//  this, GW38 would mean 570 upstream calls on every page load.
// ══════════════════════════════════════════════════════════════

import { fpl, pool, setCache, fail } from './_fpl.js';

export const config = { maxDuration: 60 };

const MAX_GWS = 6;   // keep a single invocation inside the time budget

export default async function handler(req, res) {
  const leagueId = String(req.query.league || '').replace(/\D/g, '');
  if (!leagueId) return res.status(400).json({ ok: false, error: 'Missing ?league=<id>' });

  const gws = String(req.query.gws || '')
    .split(',')
    .map(n => parseInt(n, 10))
    .filter(n => Number.isInteger(n) && n >= 1 && n <= 38)
    .slice(0, MAX_GWS);

  if (!gws.length) return res.status(400).json({ ok: false, error: 'Missing ?gws=1,2,3' });

  try {
    const [bootstrap, league] = await Promise.all([
      fpl('/bootstrap-static/'),
      fpl(`/leagues-classic/${leagueId}/standings/`)
    ]);
    if (!league?.league) {
      return res.status(404).json({ ok: false, error: `League ${leagueId} not found` });
    }

    const teams = Object.fromEntries(bootstrap.teams.map(t => [t.id, t.short_name]));
    const els = Object.fromEntries(bootstrap.elements.map(e => [e.id, {
      id: e.id,
      web: e.web_name,
      team: teams[e.team],
      pos: ['', 'GKP', 'DEF', 'MID', 'FWD'][e.element_type],
      photo: e.code
    }]));

    const results = league.standings?.results || [];
    const eventsById = Object.fromEntries(bootstrap.events.map(e => [e.id, e]));

    // Live points per gameweek (one call each)
    const liveByGw = {};
    await pool(gws, 3, async gw => {
      const d = await fpl(`/event/${gw}/live/`);
      liveByGw[gw] = Object.fromEntries((d?.elements || []).map(e => [e.id, e.stats.total_points]));
    });

    // Every (manager, gameweek) pair
    const jobs = [];
    for (const gw of gws) for (const r of results) jobs.push({ gw, r });

    const picked = await pool(jobs, 8, async ({ gw, r }) => {
      const p = await fpl(`/entry/${r.entry}/event/${gw}/picks/`);
      if (!p) return null;
      const cap = p.picks.find(x => x.is_captain);
      const vc  = p.picks.find(x => x.is_vice_captain);
      if (!cap) return null;
      const pts = liveByGw[gw]?.[cap.element] ?? 0;
      return {
        gw,
        entry: r.entry,
        name: r.player_name,
        chip: p.active_chip || null,
        captain: {
          ...(els[cap.element] || { id: cap.element, web: `#${cap.element}`, team: '?', pos: '?' }),
          mult: cap.multiplier,
          raw: pts,
          scored: pts * (cap.multiplier || 2),
          tripled: cap.multiplier === 3
        },
        vice: vc ? (els[vc.element]?.web || null) : null
      };
    });

    const rows = picked.filter(Boolean);

    // Only mark a gameweek cacheable-forever once FPL has checked the data
    const final = Object.fromEntries(gws.map(gw => [gw, !!eventsById[gw]?.data_checked]));

    setCache(res, { seconds: gws.every(g => final[g]) ? 86400 : 120 });
    res.status(200).json({
      ok: true,
      fetchedAt: new Date().toISOString(),
      gws,
      final,                 // client caches a gw permanently only when final[gw] === true
      rows
    });
  } catch (err) {
    fail(res, err);
  }
}
