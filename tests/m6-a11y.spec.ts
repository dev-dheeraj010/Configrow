import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const PAGES = ['/', '/pricing', '/faq', '/privacy', '/terms', '/nope'];

for (const scheme of ['dark', 'light'] as const) {
  test.describe(scheme, () => {
    test.use({ colorScheme: scheme, viewport: { width: 1440, height: 900 } });
    for (const path of PAGES) {
      test(`axe: ${path}`, async ({ page }) => {
        await page.goto(path);
        await page.waitForTimeout(1500);
        // reveal everything that fades in on scroll so contrast is measured on final states
        await page.addStyleTag({ content: '.rv,.fc,.cl{opacity:1!important;transform:none!important}' });
        const r = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze();
        const bad = r.violations.map((v) => `${v.id} (${v.impact}): ${v.nodes.slice(0, 3).map((n) => n.target.join(' ')).join(' | ')}`);
        expect(bad, bad.join('\n')).toEqual([]);
      });
    }
  });
}

test.describe('reduced motion', () => {
  test.use({ reducedMotion: 'reduce', viewport: { width: 1440, height: 900 } });
  test('home: cards visible, no pulses animation, no smooth-scroll lib', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(1200);
    for (const s of ['.sc1', '.sc2', '.sc3']) expect(await page.locator(s).evaluate((e) => getComputedStyle(e).opacity)).toBe('1');
    expect(await page.evaluate(() => document.documentElement.classList.contains('lenis'))).toBe(false);
  });
  test('pricing: static plan cards, real text, call link', async ({ page }) => {
    await page.goto('/pricing');
    await page.waitForTimeout(800);
    expect(await page.locator('#stage').evaluate((e) => e.getBoundingClientRect().height)).toBeLessThan(1500);
    for (const t of ['₹10,999', '₹14,549', '₹19,999']) await expect(page.locator('.fc', { hasText: t })).toBeVisible();
    await expect(page.locator('a.call')).toBeVisible();
    await page.screenshot({ path: 'shots/m6/reduced-pricing.png', fullPage: true });
  });
});

test('WebGL unavailable: home still shows all copy', async ({ browser }) => {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  await page.addInitScript(() => {
    const orig = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (this: HTMLCanvasElement, t: string, ...a: unknown[]) {
      if (/webgl/.test(t)) return null;
      return (orig as (...x: unknown[]) => unknown).call(this, t, ...a) as RenderingContext | null;
    } as typeof HTMLCanvasElement.prototype.getContext;
  });
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  await page.goto('/');
  await page.waitForTimeout(1500);
  await expect(page.locator('h1')).toContainText('Great websites build trust');
  expect(await page.locator('canvas').count()).toBe(0);
  for (const t of ['Built for real results', 'What makes us Configrow', 'Trust drives leads', "Let's build something extraordinary"]) await expect(page.getByText(t, { exact: false }).first()).toBeAttached();
  await page.screenshot({ path: 'shots/m6/no-webgl.png' });
  expect(errors).toEqual([]);
  await ctx.close();
});
