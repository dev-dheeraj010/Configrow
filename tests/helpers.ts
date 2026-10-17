import type { Page } from '@playwright/test';

/** Replaces Cloudflare's Turnstile script with a stub that "solves" instantly, so form tests need no network. */
export async function stubTurnstile(page: Page, token = 'tok') {
  await page.route('**/challenges.cloudflare.com/turnstile/v0/api.js*', (route) =>
    route.fulfill({
      contentType: 'text/javascript',
      body: `window.turnstile={render:function(el,o){var d=document.createElement('div');d.setAttribute('data-stub','1');d.textContent='verified';el.appendChild(d);setTimeout(function(){o.callback(${JSON.stringify(token)})},50);return 'w1'},reset:function(){},remove:function(){}};`,
    }));
}

/** Counts requests to Google Analytics hosts and answers them with an empty script. */
export async function trackGoogle(page: Page) {
  const hits: string[] = [];
  await page.route(/googletagmanager\.com|google-analytics\.com/, (route) => { hits.push(route.request().url()); return route.fulfill({ contentType: 'text/javascript', body: '' }); });
  return hits;
}

/** Collects every Content-Security-Policy violation the page reports. */
export async function collectCspViolations(page: Page) {
  const v: string[] = [];
  await page.addInitScript(() => {
    (window as unknown as { __csp: string[] }).__csp = [];
    document.addEventListener('securitypolicyviolation', (e) => (window as unknown as { __csp: string[] }).__csp.push(`${e.violatedDirective} ${e.blockedURI}`));
  });
  page.on('console', (m) => { if (/Content Security Policy|Refused to/i.test(m.text())) v.push(m.text().slice(0, 200)); });
  return { list: v, read: () => page.evaluate(() => (window as unknown as { __csp?: string[] }).__csp ?? []) };
}
