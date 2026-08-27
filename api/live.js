// ══════════════════════════════════════════════════════════════
//  GET /api/live?league=<id>[&gw=<n>]
//  Who is actually winning the week RIGHT NOW, and who captained
//  whom. Computed from live element points + each manager's picks,
//  so it updates as the goals go in — not at the end of the week.
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

    const state = gameweekState(bootstrap.events);
    const gw = Number(req.query.gw) || state.currentGW;
    if (!gw) return res.status(200).json({ ok: true, gw: null, note: 'Season has not started', managers: [] });

    // Reference maps: element id -> player, team id -> short name
    const teams = Object.fromEntries(bootstrap.teams.map(t => [t.id, t.short_name]));
    const els = Object.fromEntries(bootstrap.elements.map(e => [e.id, {
      id: e.id,
      web: e.web_name,
      full: `${e.first_name} ${e.second_name}`,
      team: teams[e.team],
      pos: ['', 'GKP', 'DEF', 'MID', 'FWD'][e.element_type],
      photo: e.code,
      ownedPct: parseFloat(e.selected_by_percent)
    }]));

    const results = league.standings?.results || [];

    const liveData = await fpl(`/event/${gw}/live/`);
    const livePts = {};
    const liveStats = {};
    for (const e of (liveData?.elements || [])) {
      livePts[e.id] = e.stats.total_points;
      liveStats[e.id] = {
        minutes: e.stats.minutes,
        goals: e.stats.goals_scored,
        assists: e.stats.assists,
        bonus: e.stats.bonus,
        clean: e.stats.clean_sheets,
        cards: e.stats.yellow_cards + e.stats.red_cards,
        started: e.stats.minutes > 0
      };
    }

    // Each manager's picks for this gameweek
    const picksAll = await pool(results, 6, r => fpl(`/entry/${r.entry}/event/${gw}/picks/`));

    const managers = results.map((r, i) => {
      const p = picksAll[i];
      if (!p) {
        return { entry: r.entry, name: r.player_name, team: r.entry_name, ready: false,
                 livePts: null, captain: null, seasonTotal: r.total };
      }

      const chip = p.active_chip || null;
      const hit  = p.entry_history?.event_transfers_cost || 0;

      // multiplier already accounts for captain (2 or 3) and bench boost
      let starters = 0, benchPts = 0;
      const squad = p.picks.map(pk => {
        const pts = livePts[pk.element] ?? 0;
        const el = els[pk.element] || { web: `#${pk.element}`, pos: '?', team: '?' };
        const counts = pk.multiplier > 0;
        if (counts) starters += pts * pk.multiplier; else benchPts += pts;
        return {
          ...el,
          slot: pk.position,
          mult: pk.multiplier,
          isC: pk.is_captain,
          isVC: pk.is_vice_captain,
          raw: pts,
          scored: counts ? pts * pk.multiplier : 0,
          stats: liveStats[pk.element] || null
        };
      });

      const cap = squad.find(s => s.isC) || null;
      const vc  = squad.find(s => s.isVC) || null;

      return {
        entry: r.entry,
        name: r.player_name,
        team: r.entry_name,
        seasonTotal: r.total,
        ready: true,
        chip,
        hit,
        livePts: starters - hit,
        benchPts,
        playersPlayed: squad.filter(s => s.mult > 0 && s.stats?.started).length,
        playersLeft:   squad.filter(s => s.mult > 0 && !s.stats?.started).length,
        captain: cap && {
          id: cap.id, web: cap.web, full: cap.full, team: cap.team, pos: cap.pos,
          photo: cap.photo, mult: cap.mult, raw: cap.raw, scored: cap.scored,
          played: !!cap.stats?.started, ownedPct: cap.ownedPct
        },
        vice: vc && { id: vc.id, web: vc.web, team: vc.team },
        squad
      };
    });

    // Rank by live points
    const ranked = [...managers].filter(m => m.ready).sort((a, b) => b.livePts - a.livePts);
    ranked.forEach((m, i) => {
      m.liveRank = i > 0 && ranked[i - 1].livePts === m.livePts ? ranked[i - 1].liveRank : i + 1;
    });

    // Captain popularity across the league
    const capCount = {};
    for (const m of managers) {
      if (!m.captain) continue;
      const k = m.captain.id;
      capCount[k] = capCount[k] || {
        id: m.captain.id, web: m.captain.web, full: m.captain.full,
        team: m.captain.team, pos: m.captain.pos, photo: m.captain.photo,
        raw: m.captain.raw, played: m.captain.played, ownedPct: m.captain.ownedPct,
        count: 0, by: []
      };
      capCount[k].count++;
      // entry ids, not names — two managers in this league share a
      // name (one plays under the other's account)
      capCount[k].by.push(m.entry);
    }
    const captainBoard = Object.values(capCount).sort((a, b) => b.count - a.count || b.raw - a.raw);

    const ev = bootstrap.events.find(e => e.id === gw);

    setCache(res, { seconds: state.isLive ? 90 : 600 });
    res.status(200).json({
      ok: true,
      fetchedAt: new Date().toISOString(),
      gw,
      isLive: state.isLive,
      finished: !!ev?.finished,
      dataChecked: !!ev?.data_checked,
      deadline: ev?.deadline_time || null,
      fplAverage: ev?.average_entry_score ?? null,
      fplHighest: ev?.highest_score ?? null,
      note: 'Live totals exclude automatic substitutions, which FPL only applies once the gameweek is complete.',
      managers,
      captainBoard
    });
  } catch (err) {
    fail(res, err);
  }
}
