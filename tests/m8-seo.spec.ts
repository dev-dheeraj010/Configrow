import { test, expect, APIRequestContext } from '@playwright/test';

// Everything here reads the RAW server HTML (no JavaScript), i.e. what a crawler sees on first fetch.
const PAGES: Record<string, { title: RegExp; copy: string[] }> = {
  '/': { title: /Configrow/, copy: ['Great websites build trust', 'Built for real results', 'HTML Web Development', 'Next.js / Node.js', 'PHP Web Development', 'What makes us Configrow', 'Exquisite design language', 'Continuous care, zero compromise', 'Trust drives leads', "Let&#x27;s build something extraordinary", 'APP DEVELOPMENT — COMING SOON'] },
  '/pricing': { title: /Pricing/, copy: ['Three plans', '10,999', '14,549', '19,999', 'Fully custom professional 3D website', 'Basic SEO-friendly structure', 'Call +91 94809 33776', 'RECOMMENDED'] },
  '/faq': { title: /FAQ/, copy: ['Which plan should I choose?', '7–10 business days', '40% advance', 'There is no upgrade policy'] },
  '/privacy': { title: /Privacy/, copy: ['Digital Personal Data Protection', 'Information we collect'] },
  '/terms': { title: /Terms/, copy: ['cannot be refunded', 'Master Services Agreement'] },
};

const html = async (request: APIRequestContext, path: string) => (await request.get(path)).text();
const jsonLd = (h: string) => [...h.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map((m) => JSON.parse(m[1]));

for (const [path, spec] of Object.entries(PAGES)) {
  test(`raw HTML is complete and well-formed: ${path}`, async ({ request }) => {
    const h = await html(request, path);
    expect(h).toContain('<html lang="en-IN"');
    expect(h).toMatch(/<title>[^<]{10,70}<\/title>/);
    expect(h.match(/<title>([^<]*)<\/title>/)![1]).toMatch(spec.title);
    const desc = h.match(/<meta name="description" content="([^"]*)"/)?.[1] ?? '';
    expect(desc.length).toBeGreaterThan(70); expect(desc.length).toBeLessThan(200);
    expect(h).toContain(`<link rel="canonical" href="https://www.configrow.in${path === '/' ? '' : path}`);
    expect((h.match(/<h1[ >]/g) ?? []).length).toBe(1);
    for (const p of ['og:title', 'og:description', 'og:url', 'og:image', 'og:site_name', 'twitter:card', 'twitter:image']) expect(h, p).toContain(p);
    expect(h).not.toMatch(/content="noindex/);
    for (const c of spec.copy) expect(h, `server HTML should contain "${c}"`).toContain(c);
    for (const ld of jsonLd(h)) expect(ld['@context']).toBe('https://schema.org');
    // every <img> has alt text
    for (const tag of h.match(/<img [^>]*>/g) ?? []) expect(tag).toMatch(/alt="[^"]+"/);
  });
}

test('structured data: Organization + WebSite on all pages, FAQPage, plan offers, breadcrumbs', async ({ request }) => {
  const home = jsonLd(await html(request, '/'));
  const org = home.find((d) => ([] as string[]).concat(d['@type']).includes('Organization'));
  expect(org.sameAs).toEqual(expect.arrayContaining(['https://www.youtube.com/@Configrow.01', 'https://x.com/Configrow_01', 'https://www.instagram.com/configrow.in']));
  expect(org.email).toBe('info@configrow.in');
  expect(home.find((d) => d['@type'] === 'WebSite')).toBeTruthy();

  const faq = jsonLd(await html(request, '/faq')).find((d) => d['@type'] === 'FAQPage');
  expect(faq.mainEntity.length).toBeGreaterThanOrEqual(10);
  expect(faq.mainEntity.every((q: { name: string; acceptedAnswer: { text: string } }) => q.name && q.acceptedAnswer.text.length > 20)).toBe(true);

  const price = jsonLd(await html(request, '/pricing')).find((d) => d['@type'] === 'ItemList');
  expect(price.itemListElement.map((i: { item: { offers: { price: number } } }) => i.item.offers.price)).toEqual([10999, 14549, 19999]);
  expect(price.itemListElement[0].item.offers.priceCurrency).toBe('INR');

  for (const p of ['/pricing', '/faq', '/privacy', '/terms']) expect(jsonLd(await html(request, p)).some((d) => d['@type'] === 'BreadcrumbList')).toBe(true);
});

test('crawl: sitemap lists every page, robots points to it, every internal link resolves', async ({ request }) => {
  const sm = await (await request.get('/sitemap.xml')).text();
  for (const p of Object.keys(PAGES)) expect(sm).toContain(`https://www.configrow.in${p === '/' ? '' : p}</loc>`);
  const rb = await (await request.get('/robots.txt')).text();
  expect(rb).toContain('Sitemap: https://www.configrow.in/sitemap.xml'); expect(rb).not.toMatch(/Disallow: \/\s*$/m);
  const links = new Set<string>();
  for (const p of Object.keys(PAGES)) for (const m of (await html(request, p)).matchAll(/href="(\/[^"#]*)(#[^"]*)?"/g)) links.add(m[1]);
  for (const l of links) { if (/^\/(_next|icon|apple)/.test(l)) continue; const r = await request.get(l); expect(r.status(), l).toBe(200); }
  expect((await request.get('/this-page-does-not-exist')).status()).toBe(404);
});

test('response headers: no X-Powered-By, nosniff, referrer policy', async ({ request }) => {
  const h = (await request.get('/')).headers();
  expect(h['x-powered-by']).toBeUndefined();
  expect(h['x-content-type-options']).toBe('nosniff');
  expect(h['referrer-policy']).toBe('strict-origin-when-cross-origin');
});

test('home: sections have a sensible heading outline (one h1, then h2 per chapter)', async ({ request }) => {
  const h = await html(request, '/');
  const hs = [...h.matchAll(/<h([1-4])[ >]/g)].map((m) => Number(m[1]));
  expect(hs[0]).toBe(1);
  expect(hs.filter((n) => n === 2).length).toBeGreaterThanOrEqual(4);
  for (let i = 1; i < hs.length; i++) expect(hs[i] - hs[i - 1], `heading jump at index ${i}`).toBeLessThanOrEqual(1);
});
