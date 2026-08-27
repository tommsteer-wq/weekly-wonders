// ══════════════════════════════════════════════════════════════
//  Session tracking. Records who opened the dashboard, for how
//  long, and roughly how much they poked at it.
//
//  Posts to our own /api/track, so nothing about the backend is
//  visible in the page source. Failures are swallowed — tracking
//  must never break the dashboard.
// ══════════════════════════════════════════════════════════════

let session = null;
let flushTimer = null;

const post = (payload) => {
  try {
    const body = JSON.stringify(payload);
    // sendBeacon survives the page being closed; fetch is the fallback
    if (navigator.sendBeacon) {
      navigator.sendBeacon('/api/track', new Blob([body], { type: 'application/json' }));
    } else {
      fetch('/api/track', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body, keepalive: true })
        .catch(() => {});
    }
  } catch {}
};

export function startSession(nick) {
  if (!nick) return;                 // "just looking" is not recorded
  endSession();                      // close any previous one cleanly

  const started = new Date();
  session = { id: `${nick}_${started.getTime()}`, nick, started, clicks: 0, sent: 0 };

  post({ action: 'start', id: session.id, nick, time: started.toISOString() });

  // Periodic flush so a browser that never fires unload still counts
  clearInterval(flushTimer);
  flushTimer = setInterval(() => flush(false), 60_000);
}

function flush(final) {
  if (!session) return;
  const seconds = Math.round((Date.now() - session.started.getTime()) / 1000);
  // don't spam the sheet if nothing has changed
  if (!final && session.clicks === session.sent && seconds < 60) return;
  session.sent = session.clicks;
  post({
    action: 'update',
    id: session.id,
    duration: seconds,
    clicks: session.clicks,
    loggedOut: final ? new Date().toISOString() : ''
  });
}

export function endSession() {
  if (!session) return;
  flush(true);
  clearInterval(flushTimer);
  session = null;
}

export function noteClick() {
  if (session) session.clicks++;
}

document.addEventListener('click', noteClick, true);
document.addEventListener('visibilitychange', () => { if (document.hidden) flush(true); });
window.addEventListener('pagehide', () => flush(true));
