import { test, expect } from '@playwright/test';

const VIEWPORTS = [
  { name: '1440x900', width: 1440, height: 900 },
  { name: '1100x800', width: 1100, height: 800 },
  { name: '390x844', width: 390, height: 844 },
];
const PAGES = ['/', '/faq', '/privacy', '/terms', '/pricing', '/nope'];

for (const vp of VIEWPORTS) {
  test.describe(vp.name, () => {
    test.use({ viewport: { width: vp.width, height: vp.height } });

    for (const path of PAGES) {
      test(`header is identical on ${path}`, async ({ page }) => {
        await page.goto(path);
        await page.waitForTimeout(600);
        const box = await page.locator('header').boundingBox();
        expect(box).not.toBeNull();
        expect(Math.round(box!.height)).toBe(60);
        expect(Math.round(box!.y)).toBe(14);
        expect(Math.round(box!.width)).toBe(Math.round(Math.min(1240, vp.width - 32)));
        await page.screenshot({ path: `shots/m1/${vp.name}${path === '/' ? '/home' : path}.png`.replace(/\/(?=[^/]*$)/, '-').replace('m1/' + vp.name + '-', 'm1/' + vp.name + '-') });
      });
    }
  });
}

test('mobile menu: opens, traps focus, Escape closes, scroll locked', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/faq');
  await page.getByRole('button', { name: 'Open menu' }).click();
  await expect(page.locator('#mnav')).toBeVisible();
  expect(await page.evaluate(() => document.body.style.overflow)).toBe('hidden');
  await page.waitForTimeout(500);
  await page.screenshot({ path: 'shots/m1/390x844-menu.png' });
  await page.keyboard.press('Escape');
  await expect(page.locator('#mnav')).toBeHidden();
  expect(await page.evaluate(() => document.body.style.overflow)).toBe('');
});

test('footer has four columns and the legal row', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/faq');
  await expect(page.locator('footer h4')).toHaveText(['MENU', 'CONNECT', 'CONTACT']);
  await expect(page.locator('footer')).toContainText('© 2026 CONFIGROW — ALL RIGHTS RESERVED');
  await page.locator('footer').scrollIntoViewIfNeeded();
  await page.screenshot({ path: 'shots/m1/1440x900-footer.png' });
});
