import { test, expect, Page } from '@playwright/test';

const VIEWPORTS = [{ n: '1440x900', w: 1440, h: 900 }, { n: '1100x800', w: 1100, h: 800 }, { n: '390x844', w: 390, h: 844 }];
// story units (1 = 100vh of scroll) — same numbers as lib/story.ts; the test reads the stage height from the DOM
const X0 = 0.3, L = 3.7;
const F = X0 + 2 * L + 3.2;

async function atUnit(page: Page, u: number) {
  await page.evaluate((u) => {
    const el = document.getElementById('stage')!;
    window.scrollTo(0, el.getBoundingClientRect().top + window.scrollY + u * window.innerHeight);
  }, u);
  await page.waitForTimeout(1800);
}
const txt = (page: Page, sel: string) => page.locator(sel).first().innerText();

test('prices are real DOM text in the server HTML', async ({ request }) => {
  const html = await (await request.get('/pricing')).text();
  for (const s of ['10,999', '14,549', '19,999', 'Foundation', 'Standard', 'Next-gen', 'Fully custom professional 3D website', 'Multiple hosting support', '+91 78923 17834']) expect(html).toContain(s);
  expect((html.match(/<h1/g) ?? []).length).toBe(1);
});

for (const v of VIEWPORTS) {
  test(`story ${v.n}`, async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (e) => errors.push(String(e)));
    page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
    await page.setViewportSize({ width: v.w, height: v.h });
    await page.goto('/pricing');
    await page.waitForTimeout(2000);

    // stage height = (story length + 1) * 100vh  (12.8 + 1 = 13.8 -> 1380vh)
    const h = await page.evaluate(() => document.getElementById('stage')!.offsetHeight / window.innerHeight);
    expect(h).toBeCloseTo(13.8, 1);

    const shot = (n: string) => page.screenshot({ path: `shots/m4/${v.n}-${n}.png` });
    const steps: [string, number][] = [['00-intro', 0], ['01-foundation-name', X0 + 0.5], ['02-foundation-features', X0 + 1.5], ['03-foundation-price', X0 + 2.7],
      ['04-zoom', X0 + 3.45], ['05-standard', X0 + L + 2.7], ['06-nextgen', X0 + 2 * L + 2.7], ['07-pullback', F + 0.6], ['08-finale', F + 1.9]];
    for (const [n, u] of steps) { await atUnit(page, u); await shot(n); }

    // price counts up to its value and stays on screen for >= 0.7 of a screen (here: from b+2.5 until the zoom starts at b+3.2)
    for (const [i, price] of ['10,999', '14,549', '19,999'].entries()) {
      const b = X0 + i * L;
      for (const u of [b + 2.55, b + 3.1]) {
        await atUnit(page, u);
        const pr = page.locator('.pp').nth(i).locator('.pr');
        expect(await txt(page, `.pp:nth-child(${i + 1}) .num`), `plan ${i + 1} at ${u}`).toBe(price);
        expect(parseFloat(await pr.evaluate((e) => getComputedStyle(e).opacity))).toBeGreaterThan(0.95);
      }
    }

    // finale: three plan cards with names, prices, Standard marked RECOMMENDED, call button
    await atUnit(page, F + 1.9);
    await expect(page.locator('.fc')).toHaveCount(3);
    await expect(page.locator('.fc .bd')).toHaveText('RECOMMENDED');
    await expect(page.locator('a.call')).toHaveText('Call +91 78923 17834');
    expect(await page.locator('.fc').nth(0).evaluate((e) => getComputedStyle(e).opacity)).toBe('1');
    if (v.w <= 800) expect(await page.locator('.fc ul').first().isVisible()).toBe(false);
    expect(errors.filter((e) => !/favicon|sharp/.test(e))).toEqual([]);
  });
}

test('always starts from the top on revisit', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/pricing'); await page.waitForTimeout(1200);
  await atUnit(page, 5);
  expect(await page.evaluate(() => window.scrollY)).toBeGreaterThan(3000);
  await page.reload(); await page.waitForTimeout(1200);
  expect(await page.evaluate(() => window.scrollY)).toBe(0);
});

test('skip to plans jumps to the finale', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/pricing'); await page.waitForTimeout(1200);
  await page.getByRole('button', { name: /skip to plans/i }).click();
  await page.waitForTimeout(4500);
  await expect(page.locator('a.call')).toBeVisible();
  expect(await page.locator('.fc').first().evaluate((e) => getComputedStyle(e).opacity)).toBe('1');
});
