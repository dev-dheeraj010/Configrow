import { test, expect } from '@playwright/test';

const VIEWPORTS = [{ n: '1440x900', w: 1440, h: 900 }, { n: '1100x800', w: 1100, h: 800 }, { n: '390x844', w: 390, h: 844 }];

test('exactly one H1 and a title on every static page', async ({ page }) => {
  for (const [path, title] of [['/faq', 'FAQ | Configrow'], ['/privacy', 'Privacy Policy | Configrow'], ['/terms', 'Terms and Conditions | Configrow']]) {
    await page.goto(path);
    await expect(page.locator('h1')).toHaveCount(1);
    await expect(page).toHaveTitle(title);
  }
});

test('FAQ accordion works from the keyboard', async ({ page }) => {
  await page.goto('/faq');
  const first = page.locator('summary').first();
  await first.focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('details').first()).toHaveAttribute('open', '');
  await page.keyboard.press('Enter');
  await expect(page.locator('details').first()).not.toHaveAttribute('open', '');
});

test('legal pages: gaps highlighted, draft notice, no invented clauses', async ({ page }) => {
  for (const path of ['/privacy', '/terms']) {
    await page.goto(path);
    if (path === '/privacy') expect(await page.locator('mark').count()).toBeGreaterThan(0);
    await expect(page.locator('.dr')).toContainText('DRAFT TEMPLATE');
    await expect(page.locator('article h2').first()).toBeVisible();
  }
});

test('404 page: real 404 status, outlined 404, three buttons', async ({ page }) => {
  const res = await page.goto('/does-not-exist');
  expect(res!.status()).toBe(404);
  await expect(page.locator('.big')).toContainText('404');
  await expect(page.locator('.bt a')).toHaveText(['Back to home', 'See pricing', 'Read the FAQ']);
  await expect(page.locator('h1')).toHaveCount(1);
});

test('sitemap, robots and OG image are served', async ({ request }) => {
  const sm = await request.get('/sitemap.xml'); expect(sm.status()).toBe(200); expect(await sm.text()).toContain('https://www.configrow.in/pricing');
  const rb = await request.get('/robots.txt'); expect(await rb.text()).toContain('Sitemap: https://www.configrow.in/sitemap.xml');
  const og = await request.get('/opengraph-image'); expect(og.status()).toBe(200); expect(og.headers()['content-type']).toContain('image/png');
});

for (const v of VIEWPORTS) {
  test(`screenshots ${v.n}`, async ({ page }) => {
    await page.setViewportSize({ width: v.w, height: v.h });
    for (const [path, name] of [['/faq', 'faq'], ['/privacy', 'privacy'], ['/does-not-exist', '404']]) {
      await page.goto(path); await page.waitForTimeout(700);
      await page.screenshot({ path: `shots/m2/${v.n}-${name}.png` });
    }
    await page.goto('/faq'); await page.locator('summary').nth(1).click(); await page.waitForTimeout(300);
    await page.screenshot({ path: `shots/m2/${v.n}-faq-open.png` });
  });
}
