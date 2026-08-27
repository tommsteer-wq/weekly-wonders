// ══════════════════════════════════════════════════════════════
//  Builds assets/og.png — the link preview card.
//
//  Run:  node tools/make-og-image.mjs
//  Needs: npm install --no-save @resvg/resvg-js
//
//  Committed as a PNG because WhatsApp, iMessage and Slack will
//  not render an SVG og:image.
// ══════════════════════════════════════════════════════════════

import { Resvg } from '@resvg/resvg-js';
import { writeFileSync, mkdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');

const W = 1200, H = 630;

// Midnight & Brass
const INK    = '#0B0E14';
const BRASS  = '#C9A227';
const TEXT   = '#E6E9EF';
const MUTED  = '#7C8697';
const RULE   = '#262E3B';

/** The WW4 monogram, scaled and positioned. */
const monogram = (cx, cy, size) => {
  const s = size / 100;
  const t = (x, y) => `${(cx + (x - 50) * s).toFixed(2)},${(cy + (y - 50) * s).toFixed(2)}`;
  const zig = [[24,25],[30.5,48],[37,36.5],[43.5,48],[50,25],[56.5,48],[63,36.5],[69.5,48],[76,25]]
    .map(([x, y]) => t(x, y)).join(' ');
  const p = (x, y) => t(x, y).replace(',', ' ');
  return `
    <g fill="none" stroke="${BRASS}" stroke-linejoin="round" stroke-linecap="round">
      <circle cx="${cx}" cy="${cy}" r="${44 * s}" stroke-width="${3 * s}" opacity="0.5"/>
      <polyline points="${zig}" stroke-width="${7 * s}"/>
      <path d="M${p(53.5,56)} L${p(36.5,75)} L${p(63.5,75)} M${p(53.5,56)} L${p(53.5,85)}"
            stroke-width="${7 * s}"/>
    </g>`;
};

// Four evenly spaced columns across a 980px measure
const COL_X = 110, COL_W = 245;
const stat = (i, label, value) => {
  const x = COL_X + i * COL_W;
  return `
  ${i > 0 ? `<rect x="${x - 26}" y="503" width="1" height="62" fill="${RULE}"/>` : ''}
  <text x="${x}" y="522" font-family="Arial" font-size="18" font-weight="700"
        letter-spacing="2.2" fill="${MUTED}">${label}</text>
  <text x="${x}" y="566" font-family="Georgia" font-size="35" font-weight="700"
        fill="${TEXT}">${value}</text>`;
};

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <radialGradient id="glow" cx="50%" cy="26%" r="62%">
      <stop offset="0%"   stop-color="${BRASS}" stop-opacity="0.13"/>
      <stop offset="100%" stop-color="${BRASS}" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="rule" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%"   stop-color="${BRASS}" stop-opacity="0"/>
      <stop offset="50%"  stop-color="${BRASS}" stop-opacity="0.85"/>
      <stop offset="100%" stop-color="${BRASS}" stop-opacity="0"/>
    </linearGradient>
  </defs>

  <rect width="${W}" height="${H}" fill="${INK}"/>
  <rect width="${W}" height="${H}" fill="url(#glow)"/>

  ${monogram(600, 168, 176)}

  <text x="600" y="330" text-anchor="middle" font-family="Georgia" font-size="82"
        font-weight="700" fill="${TEXT}" letter-spacing="-1.5">Weekly Wonders</text>

  <text x="600" y="382" text-anchor="middle" font-family="Arial" font-size="23"
        font-weight="700" letter-spacing="7" fill="${BRASS}">4TH EDITION · 2026/27</text>

  <rect x="360" y="428" width="480" height="2" fill="url(#rule)"/>

  ${stat(0, 'LIVE TABLE',   'every 90s')}
  ${stat(1, 'MONEY LEAGUE', '£1,140 pot')}
  ${stat(2, 'CAPTAINS',     'tracked')}
  ${stat(3, 'MANAGERS',     '15')}

  <rect x="0" y="${H - 7}" width="${W}" height="7" fill="${BRASS}" opacity="0.9"/>
</svg>`;

const resvg = new Resvg(svg, {
  fitTo: { mode: 'width', value: W },
  font: { loadSystemFonts: true, defaultFontFamily: 'Georgia' },
  background: INK
});

mkdirSync(resolve(ROOT, 'assets'), { recursive: true });
const png = resvg.render().asPng();
writeFileSync(resolve(ROOT, 'assets/og.png'), png);

console.log(`assets/og.png  ${W}x${H}  ${(png.length / 1024).toFixed(1)} KB`);
