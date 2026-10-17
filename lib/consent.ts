/**
 * Cookie consent store. One first-party cookie, `cg_consent`, remembers the visitor's choice for 12 months.
 * Essential cookies need no consent; everything optional (today: Google Analytics) must check `getConsent()?.analytics`.
 */
export type Consent = { v: 1; analytics: boolean; ts: number };

export const CONSENT_COOKIE = 'cg_consent';
export const CONSENT_CHANGED = 'cg-consent-changed';
export const CONSENT_OPEN = 'cg-consent-open';
const ONE_YEAR = 60 * 60 * 24 * 365;

export function getConsent(): Consent | null {
  if (typeof document === 'undefined') return null;
  const hit = document.cookie.split('; ').find((c) => c.startsWith(CONSENT_COOKIE + '='));
  if (!hit) return null;
  try {
    const c = JSON.parse(decodeURIComponent(hit.slice(CONSENT_COOKIE.length + 1)));
    return c && c.v === 1 && typeof c.analytics === 'boolean' ? (c as Consent) : null;
  } catch { return null; }
}

export function setConsent(analytics: boolean) {
  const value = encodeURIComponent(JSON.stringify({ v: 1, analytics, ts: Date.now() } satisfies Consent));
  const secure = location.protocol === 'https:' ? '; Secure' : '';
  document.cookie = `${CONSENT_COOKIE}=${value}; Max-Age=${ONE_YEAR}; Path=/; SameSite=Lax${secure}`;
  if (!analytics) clearAnalyticsCookies();
  window.dispatchEvent(new Event(CONSENT_CHANGED));
}

/** Removes Google Analytics cookies (_ga, _ga_XXXX, _gid) on this host and its parent domain. */
export function clearAnalyticsCookies() {
  const host = location.hostname, parts = host.split('.');
  const domains = ['', host, '.' + host, ...(parts.length > 2 ? ['.' + parts.slice(-2).join('.')] : [])];
  document.cookie.split('; ').map((c) => c.split('=')[0]).filter((n) => n === '_ga' || n === '_gid' || n.startsWith('_ga_') || n.startsWith('_gat')).forEach((name) => {
    domains.forEach((d) => { document.cookie = `${name}=; Max-Age=0; Path=/${d ? `; Domain=${d}` : ''}`; });
  });
}

/** Re-opens the consent banner (used by the footer "Cookie settings" button). */
export const openConsent = () => window.dispatchEvent(new Event(CONSENT_OPEN));
