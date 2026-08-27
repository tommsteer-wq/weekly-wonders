// ══════════════════════════════════════════════════════════════
//  Server-side only. Nothing in here is ever sent to the browser.
//
//  These read from Vercel environment variables, falling back to
//  last season's values so everything keeps working untouched.
//  The fallbacks live in a PUBLIC repo, so they are not secret —
//  set the env vars in Vercel to make them actually private:
//
//    Vercel → weekly-wonders → Settings → Environment Variables
//      TRACKING_URL   the Apps Script /exec URL
//      ADMIN_PIN      the admin PIN
//
//  `usingEnv` below is surfaced in the admin panel so it is obvious
//  which mode we are in.
// ══════════════════════════════════════════════════════════════

const FALLBACK_TRACKING_URL =
  'https://script.google.com/macros/s/AKfycbyQG7rbVCHCc7fGXXYIf9105rBUq8_MyI_4jkfFGzDFAISrKVEHtvK0nySHEFRLEpkmnA/exec';
const FALLBACK_PIN = '39373';

export const TRACKING_URL = process.env.TRACKING_URL || FALLBACK_TRACKING_URL;
export const ADMIN_PIN    = process.env.ADMIN_PIN    || FALLBACK_PIN;

export const usingEnv = {
  trackingUrl: !!process.env.TRACKING_URL,
  pin:         !!process.env.ADMIN_PIN
};

/** Constant-time-ish compare so the PIN can't be probed by timing. */
export function pinMatches(supplied) {
  const a = String(supplied ?? '');
  const b = String(ADMIN_PIN);
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}
