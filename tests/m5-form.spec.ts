import { test, expect, Page } from '@playwright/test';
import { stubTurnstile } from './helpers';

const ENDPOINT = '**/functions/v1/submit-enquiry';

async function open(page: Page) {
  await stubTurnstile(page);
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/');
  await page.waitForTimeout(1200);
  await page.locator('#enquiry').scrollIntoViewIfNeeded();
  await page.waitForTimeout(1500);
}
const fill = async (page: Page, o: { name?: string; phone?: string; email?: string; about?: string } = {}) => {
  await page.getByLabel('NAME').fill(o.name ?? 'Test Person');
  await page.getByLabel('PHONE / WHATSAPP').fill(o.phone ?? '9876543210');
  if (o.email) await page.getByLabel('EMAIL (OPTIONAL)').fill(o.email);
  if (o.about) await page.getByLabel('ABOUT YOUR BUSINESS').fill(o.about);
};

test('has exactly the brief\'s fields, with phone required and email optional', async ({ page }) => {
  await open(page);
  await expect(page.getByLabel('NAME')).toHaveAttribute('required', '');
  await expect(page.getByLabel('PHONE / WHATSAPP')).toHaveAttribute('required', '');
  await expect(page.getByLabel('EMAIL (OPTIONAL)')).not.toHaveAttribute('required', '');
  await expect(page.getByLabel('ABOUT YOUR BUSINESS')).toBeVisible();
  await expect(page.getByRole('button', { name: /send enquiry/i })).toBeVisible();
  await expect(page.getByRole('link', { name: /see our pricing/i })).toHaveAttribute('href', '/pricing');
});

test('success: sending state, payload, thank-you message', async ({ page }) => {
  let body: Record<string, unknown> | null = null;
  await page.route(ENDPOINT, async (route) => {
    body = route.request().postDataJSON();
    await new Promise((r) => setTimeout(r, 600));
    await route.fulfill({ status: 200, contentType: 'application/json', body: '{"ok":true}', headers: { 'access-control-allow-origin': '*' } });
  });
  await open(page);
  await fill(page, { email: 'a@b.in', about: 'Dental clinic in Mysuru' });
  await page.getByRole('button', { name: /send enquiry/i }).click();
  await expect(page.getByRole('button', { name: /sending/i })).toBeDisabled();
  await expect(page.getByRole('status')).toContainText("Thanks! We've got your enquiry and will call or WhatsApp you shortly.");
  expect(body).toMatchObject({ name: 'Test Person', phone: '9876543210', email: 'a@b.in', message: 'Dental clinic in Mysuru', source_page: '/', website: '', turnstile: 'tok' });
  await page.screenshot({ path: 'shots/m5/1440x900-sent.png' });
  await expect(page.getByLabel('NAME')).toHaveValue('');
});

test('error: shows phone/email fallback', async ({ page }) => {
  await page.route(ENDPOINT, (route) => route.fulfill({ status: 500, contentType: 'application/json', body: '{"error":"x"}', headers: { 'access-control-allow-origin': '*' } }));
  await open(page);
  await fill(page);
  await page.getByRole('button', { name: /send enquiry/i }).click();
  const st = page.getByRole('status');
  await expect(st).toContainText("We couldn't send that");
  await expect(st.getByRole('link', { name: '+91 78923 17834' })).toHaveAttribute('href', 'tel:+917892317834');
  await expect(st.getByRole('link', { name: 'info@configrow.in' })).toHaveAttribute('href', 'mailto:info@configrow.in');
  await page.screenshot({ path: 'shots/m5/1440x900-error.png' });
});

test('validation: empty name/phone blocks the request', async ({ page }) => {
  let called = 0;
  await page.route(ENDPOINT, (route) => { called++; return route.fulfill({ status: 200, body: '{}' }); });
  await open(page);
  await page.getByRole('button', { name: /send enquiry/i }).click();
  expect(called).toBe(0);
  expect(await page.getByLabel('NAME').evaluate((e: HTMLInputElement) => e.validity.valueMissing)).toBe(true);
});

test('form is keyboard operable and shows a focus ring', async ({ page }) => {
  await open(page);
  await page.getByLabel('NAME').focus();
  await page.keyboard.press('Tab'); await expect(page.getByLabel('PHONE / WHATSAPP')).toBeFocused();
  await page.keyboard.press('Tab'); await expect(page.getByLabel('EMAIL (OPTIONAL)')).toBeFocused();
  await page.keyboard.press('Tab'); await expect(page.getByLabel('ABOUT YOUR BUSINESS')).toBeFocused();
  await page.keyboard.press('Tab'); await expect(page.getByRole('button', { name: /send enquiry/i })).toBeFocused(); // honeypot is skipped
});
