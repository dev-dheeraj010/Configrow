import { test, expect, Page } from '@playwright/test';

const PROGRESS = [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.85, 1];
const VIEWPORTS = [{ n: '1440x900', w: 1440, h: 900 }, { n: '1100x800', w: 1100, h: 800 }];

/** Scroll to a progress through #services' pinned range (top top -> bottom bottom), computed from the DOM. */
async function goToPin(page: Page, p: number) {
  await page.evaluate((p) => {
    const el = document.getElementById('services')!;
    const top = el.getBoundingClientRect().top + window.scrollY;
    window.scrollTo(0, top + p * (el.offsetHeight - window.innerHeight));
  }, p);
  await page.waitForTimeout(2200); // scrub smoothing is 0.6s; Lenis adds a little more
}
const cardState = (page: Page) => page.evaluate(() => {
  const g = (s: string) => parseFloat(getComputedStyle(document.querySelector(s)!).opacity);
  return { head: g('#services h2'), c1: g('.sc1'), c2: g('.sc2'), c3: g('.sc3') };
});
const r = (n: number) => Math.round(n * 100) / 100;

for (const v of VIEWPORTS) {
  test.describe(v.n, () => {
    test.use({ viewport: { width: v.w, height: v.h } });

    test('cards enter alone, in order, and reverse exactly', async ({ page }) => {
      await page.goto('/');
      await page.waitForTimeout(1500);
      const seen: Record<number, ReturnType<typeof r>[]> = {};
      const log: string[] = [];
      for (const p of PROGRESS) {
        await goToPin(page, p);
        const s = await cardState(page);
        seen[p] = [r(s.head), r(s.c1), r(s.c2), r(s.c3)];
        log.push(`p=${p}  head ${r(s.head)}  c1 ${r(s.c1)}  c2 ${r(s.c2)}  c3 ${r(s.c3)}`);
        await page.screenshot({ path: `shots/m3/${v.n}-services-${String(Math.round(p * 100)).padStart(3, '0')}.png` });
      }
      console.log(log.join('\n'));
      // heading is in by 0.06; at progress 0 nothing else is visible
      expect(seen[0][1] + seen[0][2] + seen[0][3]).toBe(0);
      expect(seen[0.1][0]).toBe(1);
      // card 1 is entering at 0.1 and done by 0.3; cards 2 and 3 are hidden until their own windows
      expect(seen[0.1][1]).toBeGreaterThan(0); expect(seen[0.1][1]).toBeLessThan(1);
      expect(seen[0.1][2] + seen[0.1][3]).toBe(0);
      expect(seen[0.3][1]).toBe(1); expect(seen[0.3][2]).toBe(0); expect(seen[0.3][3]).toBe(0);
      // card 2 window 0.34-0.58
      expect(seen[0.4][1]).toBe(1); expect(seen[0.4][2]).toBeGreaterThan(0); expect(seen[0.4][2]).toBeLessThan(1); expect(seen[0.4][3]).toBe(0);
      expect(seen[0.6][2]).toBe(1); expect(seen[0.6][3]).toBe(0);
      // card 3 window 0.62-0.86
      expect(seen[0.7][3]).toBeGreaterThan(0); expect(seen[0.7][3]).toBeLessThan(1);
      expect(seen[0.85][3]).toBeGreaterThan(0.9);
      expect(seen[1].slice(1)).toEqual([1, 1, 1]);
      // scrolling back reverses exactly
      for (const p of [...PROGRESS].reverse()) {
        await goToPin(page, p);
        const s = await cardState(page);
        expect([r(s.head), r(s.c1), r(s.c2), r(s.c3)], `reverse at ${p}`).toEqual(seen[p]);
      }
    });

    test('logo move finishes before card 1 starts', async ({ page }) => {
      await page.goto('/');
      await page.waitForTimeout(1500);
      // scene state is module-level; read it through the canvas-independent global hook if present
      await goToPin(page, 0);
      const ok = await page.evaluate(() => (window as unknown as { __scene?: { px: number; solid: number; grid: number } }).__scene);
      expect(ok, 'window.__scene hook (dev/test only)').toBeTruthy();
      expect(ok!.solid).toBeCloseTo(1, 1);
      expect(ok!.grid).toBeCloseTo(0, 1);
    });
  });
}
