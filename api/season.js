// ══════════════════════════════════════════════════════════════
//  GET /api/season?league=<id>
//  Standings + every manager's full gameweek history + chips.
//  One cached response serves the whole league.
// ══════════════════════════════════════════════════════════════

import { fpl, pool, gameweekState, setCache, fail } from './_fpl.js';

export const config = { maxDuration: 30 };

export default async function handler(req, res) {
  const leagueId = String(req.query.league || '').replace(/\D/g, '');
  if (!leagueId) return res.status(400).json({ ok: false, error: 'Missing ?league=<id>' });

  try {
    const [bootstrap, league] = await Promise.all([
      fpl('/bootstrap-static/'),
      fpl(`/leagues-classic/${leagueId}/standings/`)
    ]);

    if (!league?.league) {
      return res.status(404).json({ ok: false, error: `League ${leagueId} not found` });
    }

    const gw = gameweekState(bootstrap.events);
    const results = league.standings?.results || [];

    // Pull each manager's history in parallel (bounded).
    const histories = await pool(results, 6, r => fpl(`/entry/${r.entry}/history/`));

    const managers = results.map((r, i) => {
      const h = histories[i];
      const season = (h?.current || []).map(g => ({
        gw:        g.event,
        pts:       g.points - g.event_transfers_cost,   // net of hits
        gross:     g.points,
        hit:       g.event_transfers_cost,
        transfers: g.event_transfers,
        bench:     g.points_on_bench,
        rank:      g.rank,
        value:     g.value / 10,
        bank:      g.bank / 10
      }));

      return {
        entry:      r.entry,
        name:       r.player_name,
        team:       r.entry_name,
        rank:       r.rank,
        lastRank:   r.last_rank,
        total:      r.total,
        gwPts:      r.event_total,
        gwHistory:  season,
        pts:        season.map(g => g.pts),
        chips:      (h?.chips || []).map(c => ({ name: c.name, gw: c.event })),
        totalHits:  season.reduce((a, g) => a + g.hit, 0),
        benchTotal: season.reduce((a, g) => a + g.bench, 0)
      };
    });

    setCache(res, { seconds: gw.isLive ? 120 : 900 });
    res.status(200).json({
      ok: true,
      fetchedAt: new Date().toISOString(),
      league: { id: league.league.id, name: league.league.name, created: league.league.created },
      gameweek: gw,
      managers
    });
  } catch (err) {
    fail(res, err);
  }
}
