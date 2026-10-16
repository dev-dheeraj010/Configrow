import { test, expect, Page } from '@playwright/test';

const VIEWPORTS = [{ n: '1440x900', w: 1440, h: 900 }, { n: '1100x800', w: 1100, h: 800 }, { n: '390x844', w: 390, h: 844 }];

/** Scroll to a progress through a section's pin range (or, for non-pinned ones, to its top). All from the DOM. */
async function at(page: Page, id: string, p: number) {
  await page.evaluate(([id, p]) => {
    const el = document.getElementById(id as string)!;
    const top = el.getBoundingClientRect().top + window.scrollY;
    window.scrollTo(0, top + (p as number) * Math.max(0, el.offsetHeight - window.innerHeight));
  }, [id, p] as const);
  await page.waitForTimeout(2200);
}

for (const v of VIEWPORTS) {
  test(`home chapters ${v.n}`, async ({ page }) => {
    const errors: string[] = [];
    page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
    page.on('pageerror', (e) => errors.push(String(e)));
    await page.setViewportSize({ width: v.w, height: v.h });
    await page.goto('/');
    await page.waitForTimeout(2000);
    const shot = (n: string) => page.screenshot({ path: `shots/m3/${v.n}-${n}.png` });

    await at(page, 'hero', 0); await shot('1-hero');
    for (const [i, p] of [0, 0.05, 0.3, 0.5, 0.8, 0.95].entries()) { await at(page, 'promise', p); await shot(`3-promise-${i}`); }
    await at(page, 'about', 0); await shot('4-growth');
    await at(page, 'enquiry', 0); await shot('5-enquiry');

    // Promise: the five nodes light up one by one at the brief's thresholds, payoff at 90%
    const lit = async () => page.locator('#promise .pm.on').count();
    await at(page, 'promise', 0.05); expect(await lit()).toBe(0);
    for (const [k, p] of [[1, 0.12], [2, 0.3], [3, 0.46], [4, 0.63], [5, 0.8]]) { await at(page, 'promise', p); expect(await lit(), `at ${p}`).toBe(k); }
    await at(page, 'promise', 0.85); await expect(page.locator('#std')).not.toHaveClass(/on/);
    await at(page, 'promise', 0.95); await expect(page.locator('#std')).toHaveClass(/on/);
    expect(errors.filter((e) => !/favicon|sharp/.test(e))).toEqual([]);
  });
}

test('promise: nodes and tile-edge lines geometry (desktop)', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/');
  await page.waitForTimeout(1500);
  await at(page, 'promise', 0.85);
  const g = await page.evaluate(() => {
    const st = document.querySelector('#promise .stick')!.getBoundingClientRect();
    const nodes = Array.from(document.querySelectorAll('#promise .pm')).map((n) => { const r = n.getBoundingClientRect(); return [r.left + r.width / 2 - st.left, r.top + r.height / 2 - st.top]; });
    return { W: st.width, H: st.height, nodes, paths: document.querySelectorAll('#promise .bl').length, pulses: document.querySelectorAll('#promise .pu.on').length };
  });
  const cx = g.W / 2, cy = g.H / 2, Rx = Math.min(g.W * 0.28, 430), Ry = Math.min(g.H * 0.25, 250);
  [-90, -18, 54, 126, 198].forEach((deg, i) => {
    const t = (deg * Math.PI) / 180;
    expect(Math.abs(g.nodes[i][0] - (cx + Rx * Math.cos(t)))).toBeLessThan(2);
    expect(Math.abs(g.nodes[i][1] - (cy + Ry * Math.sin(t)))).toBeLessThan(2);
  });
  expect(g.paths).toBe(5); expect(g.pulses).toBe(5);
});
