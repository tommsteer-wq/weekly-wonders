// ── small DOM + formatting helpers ────────────────────────────

export const $  = (sel, root = document) => root.querySelector(sel);
export const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

/** Escape anything that came from FPL — team names are user input. */
export const esc = s => String(s ?? '').replace(/[&<>"']/g, c =>
  ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

export const html = (node, markup) => { if (node) node.innerHTML = markup; };

export const initials = name => String(name || '?')
  .split(/\s+/).filter(Boolean).slice(0, 2).map(w => w[0]).join('').toUpperCase();

export const fmt = n => Number.isFinite(n) ? n.toLocaleString('en-GB') : '—';

export const money = n => {
  if (!Number.isFinite(n)) return '—';
  const v = Math.abs(n);
  const s = v % 1 === 0 ? v.toFixed(0) : v.toFixed(2);
  return (n < 0 ? '−£' : '£') + s;
};

export const ordinal = n => {
  const s = ['th', 'st', 'nd', 'rd'], v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
};

/** Rank movement chevron. */
export function movement(rank, lastRank) {
  if (!lastRank || lastRank === 0 || rank === lastRank) return '<span class="mv same">–</span>';
  const d = lastRank - rank;
  return d > 0
    ? `<span class="mv up">▲ ${d}</span>`
    : `<span class="mv down">▼ ${Math.abs(d)}</span>`;
}

export const avatar = (name, cls = 'avatar') =>
  `<span class="${cls}">${esc(initials(name))}</span>`;

/** Manager cell used in every table. */
export const mgrCell = (display, team) => `
  <div class="mgr">
    ${avatar(display)}
    <div style="min-width:0">
      <div class="mgr-name">${esc(display)}</div>
      <div class="mgr-team">${esc(team || '')}</div>
    </div>
  </div>`;

export const rowClass = (i, total, isMe) => {
  const c = [];
  if (i === 0) c.push('r1');
  else if (i === 1) c.push('r2');
  else if (i === 2) c.push('r3');
  if (i === total - 1) c.push('last');
  if (isMe) c.push('is-me');
  return c.join(' ');
};

export const empty = (title, body, mark = '—') => `
  <div class="empty">
    <div class="mark">${mark}</div>
    <h3>${esc(title)}</h3>
    <p>${esc(body)}</p>
  </div>`;

export const skeletonRows = (rows = 6, cols = 4) =>
  Array.from({ length: rows }, () =>
    `<tr>${Array.from({ length: cols }, (_, i) =>
      `<td><div class="skel" style="width:${i === 0 ? 70 : 40 + Math.random() * 40}%"></div></td>`).join('')}</tr>`
  ).join('');

/** Mean / standard deviation, used for the consistency table. */
export function stats(arr) {
  const a = arr.filter(Number.isFinite);
  if (!a.length) return { mean: 0, sd: 0, min: 0, max: 0 };
  const mean = a.reduce((x, y) => x + y, 0) / a.length;
  const sd = Math.sqrt(a.reduce((s, x) => s + (x - mean) ** 2, 0) / a.length);
  return { mean, sd, min: Math.min(...a), max: Math.max(...a) };
}

export const pct = (v, max) => max > 0 ? Math.max(0, Math.min(100, (v / max) * 100)) : 0;
