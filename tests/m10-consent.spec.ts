import { test, expect, Page } from '@playwright/test';
import { collectCspViolations, trackGoogle } from './helpers';

test.use({ storageState: { cookies: [], origins: [] }, viewport: { width: 1440, height: 900 } }); // a first-time visitor

const consentCookie = (page: Page) => page.context().cookies().then((c) => c.find((x) => x.name === 'cg_consent'));

test('first visit: banner is shown, nothing is sent to Google, both choices equally prominent', async ({ page }) => {
  const google = await trackGoogle(page);
  await page.goto('/');
  await page.waitForTimeout(1500);
  const banner = page.getByRole('dialog', { name: 'Cookies' });
  await expect(banner).toBeVisible();
  const essential = banner.getByRole('button', { name: 'Essential only' }), all = banner.getByRole('button', { name: 'Accept all' });
  await expect(essential).toBeVisible();
  await expect(all).toBeVisible();
  const a = await essential.boundingBox(), b = await all.boundingBox();
  expect(Math.abs(a!.width - b!.width)).toBeLessThan(2);
  expect(Math.abs(a!.height - b!.height)).toBeLessThan(2);
  expect(await consentCookie(page)).toBeUndefined();
  expect(google).toEqual([]);
  await page.screenshot({ path: 'shots/m10/banner-1440x900.png' });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({ path: 'shots/m10/banner-390x844.png' });
});

test('Essential only: remembered across reloads, never loads Google, sets no _ga cookies', async ({ page }) => {
  const google = await trackGoogle(page);
  await page.goto('/faq');
  await page.getByRole('button', { name: 'Essential only' }).click();
  await expect(page.getByRole('dialog', { name: 'Cookies' })).toBeHidden();
  const c = await consentCookie(page);
  expect(JSON.parse(decodeURIComponent(c!.value))).toMatchObject({ v: 1, analytics: false });
  expect(c!.sameSite).toBe('Lax');
  expect(c!.expires - Date.now() / 1000).toBeGreaterThan(360 * 24 * 3600);
  await page.reload();
  await page.waitForTimeout(1200);
  await expect(page.getByRole('dialog', { name: 'Cookies' })).toBeHidden();
  expect(google).toEqual([]);
  expect((await page.context().cookies()).some((x) => x.name.startsWith('_ga'))).toBe(false);
});

test('Accept all loads Google Analytics only then; withdrawing consent clears its cookies', async ({ page }) => {
  const google = await trackGoogle(page);
  const csp = await collectCspViolations(page);
  await page.goto('/');
  await page.waitForTimeout(1200);
  expect(google).toEqual([]);
  await page.getByRole('button', { name: 'Accept all' }).click();
  await page.waitForTimeout(1500);
  expect(google.some((u) => u.includes('googletagmanager.com/gtag/js?id=G-TEST000000'))).toBe(true);
  expect(await page.evaluate(() => (window as unknown as { dataLayer?: unknown[] }).dataLayer?.length ?? 0)).toBeGreaterThan(0);
  expect(JSON.parse(decodeURIComponent((await consentCookie(page))!.value)).analytics).toBe(true);
  // pretend GA set its cookies, then withdraw consent from the footer
  await page.evaluate(() => { document.cookie = '_ga=GA1.1.1.1; Path=/'; document.cookie = '_ga_TEST000000=GS1.1.1; Path=/'; });
  const settings = page.getByRole('button', { name: 'COOKIE SETTINGS' });
  await settings.scrollIntoViewIfNeeded();
  await settings.click();
  const banner = page.getByRole('dialog', { name: 'Cookies' });
  await expect(banner).toBeVisible();
  await expect(banner.getByRole('button', { name: 'Essential only' })).toBeFocused();
  await banner.getByRole('button', { name: 'Essential only' }).click();
  await page.waitForTimeout(500);
  expect((await page.context().cookies()).some((x) => x.name.startsWith('_ga'))).toBe(false);
  expect(await csp.read()).toEqual([]);
});

test('banner is keyboard operable and does not steal focus on first load', async ({ page }) => {
  await page.goto('/terms');
  await page.waitForTimeout(1200);
  expect(await page.evaluate(() => document.activeElement?.closest('.cc') ?? null)).toBeNull();
  await page.getByRole('button', { name: 'Essential only' }).focus();
  await page.keyboard.press('Tab');
  await expect(page.getByRole('button', { name: 'Accept all' })).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('dialog', { name: 'Cookies' })).toBeHidden();
});

test('privacy page lists the cookies we set', async ({ page }) => {
  await page.goto('/privacy');
  await expect(page.locator('article')).toContainText('cg_consent');
  await expect(page.locator('article')).toContainText('_ga');
});
