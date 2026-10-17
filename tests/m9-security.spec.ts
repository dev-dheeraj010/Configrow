import { test, expect } from '@playwright/test';
import { collectCspViolations, stubTurnstile, trackGoogle } from './helpers';

const PAGES = ['/', '/pricing', '/faq', '/privacy', '/terms', '/does-not-exist'];

test('security headers are present on every page', async ({ request }) => {
  for (const p of PAGES) {
    const h = (await request.get(p)).headers();
    const csp = h['content-security-policy'] ?? '';
    expect(csp, p).toContain("default-src 'self'");
    expect(csp).toContain("object-src 'none'");
    expect(csp).toContain("frame-ancestors 'none'");
    expect(csp).toContain("base-uri 'self'");
    expect(csp).toContain("form-action 'self'");
    expect(csp).toContain('https://challenges.cloudflare.com');
    expect(csp).not.toContain("'unsafe-eval'");
    expect(h['strict-transport-security']).toContain('max-age=63072000');
    expect(h['x-frame-options']).toBe('DENY');
    expect(h['x-content-type-options']).toBe('nosniff');
    expect(h['referrer-policy']).toBe('strict-origin-when-cross-origin');
    expect(h['permissions-policy']).toContain('camera=()');
    expect(h['cross-origin-opener-policy']).toBe('same-origin');
    expect(h['x-powered-by']).toBeUndefined();
  }
});

test('no CSP violations on any page (home scene, pricing story, form widget, analytics after consent)', async ({ page, context }) => {
  await context.addCookies([{ name: 'cg_consent', value: encodeURIComponent(JSON.stringify({ v: 1, analytics: true, ts: 1 })), domain: 'localhost', path: '/' }]);
  await stubTurnstile(page);
  await trackGoogle(page);
  const csp = await collectCspViolations(page);
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  await page.setViewportSize({ width: 1440, height: 900 });
  for (const p of PAGES) {
    await page.goto(p);
    await page.waitForTimeout(1500);
    if (p === '/') { await page.locator('#enquiry').scrollIntoViewIfNeeded(); await page.waitForTimeout(1500); }
    if (p === '/pricing') { await page.mouse.wheel(0, 4000); await page.waitForTimeout(1500); }
  }
  expect(await csp.read()).toEqual([]);
  expect(csp.list).toEqual([]);
  expect(errors).toEqual([]);
});

test('no image optimizer endpoint and no secrets in served HTML', async ({ request }) => {
  expect((await request.get('/_next/image?url=%2Fcg-mark.png&w=64&q=75')).status()).toBe(404);
  const txt = await (await request.get('/')).text();
  expect(txt).not.toMatch(/service_role|sb_secret|WHATSAPP_TOKEN|TURNSTILE_SECRET/);
});

test('security.txt is served', async ({ request }) => {
  const r = await request.get('/.well-known/security.txt');
  expect(r.status()).toBe(200);
  expect(await r.text()).toContain('Contact: mailto:info@configrow.in');
});

test('external links open safely', async ({ page }) => {
  await page.goto('/faq');
  const bad = await page.evaluate(() => Array.from(document.querySelectorAll('a[target="_blank"]')).filter((a) => !/noopener/.test(a.getAttribute('rel') ?? '')).length);
  expect(bad).toBe(0);
});

test('form: submit stays disabled until the security check is solved', async ({ page }) => {
  await page.route('**/challenges.cloudflare.com/turnstile/v0/api.js*', (r) => r.fulfill({ contentType: 'text/javascript', body: 'window.turnstile={render:function(){return "w"},reset:function(){},remove:function(){}};' }));
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/');
  await page.locator('#enquiry').scrollIntoViewIfNeeded();
  await page.waitForTimeout(1500);
  await expect(page.getByRole('button', { name: /send enquiry/i })).toBeDisabled();
});
