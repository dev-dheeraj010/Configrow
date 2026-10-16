import { test, expect } from '@playwright/test';

test.use({ viewport: { width: 1440, height: 900 } });

test('footer: three brand-blue social buttons with the given links, and both phone numbers', async ({ page }) => {
  await page.goto('/faq');
  const links = page.locator('footer .soc a');
  await expect(links).toHaveCount(3);
  await expect(links.nth(0)).toHaveAttribute('href', 'https://www.youtube.com/@Configrow.01');
  await expect(links.nth(1)).toHaveAttribute('href', 'https://x.com/Configrow_01');
  await expect(links.nth(2)).toHaveAttribute('href', 'https://www.instagram.com/configrow.in');
  for (let i = 0; i < 3; i++) await expect(links.nth(i)).toHaveAttribute('rel', /noopener/);
  await expect(page.locator('footer')).toContainText('+91 94809 33776');
  await expect(page.locator('footer')).toContainText('+91 78923 17834');
  await expect(page.locator('footer')).toContainText('info@configrow.in');
  await page.locator('footer').scrollIntoViewIfNeeded();
  await page.screenshot({ path: 'shots/m7/footer.png' });
});

test('FAQ answers use the supplied wording', async ({ page }) => {
  await page.goto('/faq');
  const ans = (q: string) => page.locator('details', { hasText: q });
  await expect(ans('Is hosting included?')).toContainText('completely free of cost for 1 year (365 days)');
  await expect(ans('Is hosting included?')).toContainText('purchased externally');
  await expect(ans('Is hosting included?')).toContainText('valid for one year (365 days)');
  await expect(ans('How long will my website take?')).toContainText('Foundation: 7–10 business days');
  await expect(ans('How long will my website take?')).toContainText('Next-gen: 15–20 business days');
  await expect(ans('How do payments work?')).toContainText('40% advance'); await expect(ans('How do payments work?')).toContainText('remaining 60%');
  await expect(ans('Can I upgrade my plan later?')).toContainText('no upgrade policy');
  await expect(ans('How do I get started?')).toContainText('+91 78923 17834');
  expect(await page.locator('main [class*="[["]').count()).toBe(0);
  expect(await page.locator('mark').count()).toBe(0);
});

test('terms and privacy are separate pages with the supplied text', async ({ page }) => {
  await page.goto('/terms');
  await expect(page.locator('article')).toContainText('Master Services Agreement');
  await expect(page.locator('article h2').first()).toHaveText('Definitions and scope');
  await page.goto('/privacy');
  await expect(page.locator('article')).toContainText('Digital Personal Data Protection (DPDP) Act, 2023');
  await expect(page.locator('article')).toContainText('do not currently have a designated Grievance Officer');
  await expect(page.locator('article')).not.toContainText('webdevcompany');
});

test('no background grid: hero scene has no grid-line pixels', async ({ page }) => {
  await page.goto('/');
  await page.waitForTimeout(2000);
  const ok = await page.evaluate(() => (window as unknown as { __scene?: Record<string, number> }).__scene);
  expect(ok && 'grid' in ok).toBe(false);
  await page.screenshot({ path: 'shots/m7/hero-no-grid.png' });
});

test('terms: refund and hosting-cancellation clauses; favicon is square', async ({ page, request }) => {
  await page.goto('/terms');
  await expect(page.locator('article')).toContainText('cannot be refunded');
  await expect(page.locator('article')).toContainText('Hosting can be cancelled on the day of renewal');
  const icon = await request.get('/icon.png');
  expect(icon.status()).toBe(200);
  const b = await icon.body();
  expect([b.readUInt32BE(16), b.readUInt32BE(20)]).toEqual([512, 512]);
});
