// Post-deploy smoke test. Usage: node scripts/smoke.mjs https://www.configrow.in
// Read-only: it fetches pages and sends one CORS preflight; it never submits an enquiry.
const base = (process.argv[2] ?? '').replace(/\/+$/, '');
if (!/^https?:\/\//.test(base)) { console.error('Usage: node scripts/smoke.mjs https://www.configrow.in'); process.exit(2); }

const PAGES = {
  '/': ['Great websites build trust', 'Built for real results', 'What makes us Configrow', 'Trust drives leads', 'build something extraordinary'],
  '/pricing': ['10,999', '14,549', '19,999', 'Foundation', 'Standard', 'Next-gen'],
  '/faq': ['Which plan should I choose?', 'business days'],
  '/privacy': ['Information we collect', 'Cookies we set'],
  '/terms': ['cannot be refunded', 'Master Services Agreement'],
};
let failed = 0;
const ok = (cond, msg) => { console.log(`${cond ? 'PASS' : 'FAIL'}  ${msg}`); if (!cond) failed++; };
const get = (p, init) => fetch(base + p, { redirect: 'manual', ...init });

for (const [path, needles] of Object.entries(PAGES)) {
  const r = await get(path);
  const html = await r.text();
  ok(r.status === 200, `${path} -> 200 (got ${r.status})`);
  for (const n of needles) ok(html.includes(n), `${path} contains "${n}" in the server HTML`);
  ok((html.match(/<h1[ >]/g) ?? []).length === 1, `${path} has exactly one h1`);
  ok(/<link rel="canonical" href="https:\/\/www\.configrow\.in/.test(html), `${path} canonical points at https://www.configrow.in`);
  ok(html.includes('og:image') && html.includes('application/ld+json'), `${path} has Open Graph image and JSON-LD`);
  const h = r.headers;
  const csp = h.get('content-security-policy') ?? '';
  ok(csp.includes("default-src 'self'") && csp.includes("frame-ancestors 'none'") && csp.includes("object-src 'none'"), `${path} sends a strict CSP`);
  ok(/max-age=\d{7,}/.test(h.get('strict-transport-security') ?? '') || base.startsWith('http://'), `${path} sends HSTS (https only)`);
  ok(h.get('x-frame-options') === 'DENY' && h.get('x-content-type-options') === 'nosniff', `${path} sends X-Frame-Options and nosniff`);
  ok(!h.get('x-powered-by'), `${path} hides X-Powered-By`);
}

const nf = await get('/definitely-not-a-page');
ok(nf.status === 404, `unknown URL -> 404 (got ${nf.status})`);
const sm = await (await get('/sitemap.xml')).text();
ok(Object.keys(PAGES).every((p) => sm.includes(`https://www.configrow.in${p === '/' ? '' : p}</loc>`)), 'sitemap.xml lists every page');
ok((await (await get('/robots.txt')).text()).includes('Sitemap: https://www.configrow.in/sitemap.xml'), 'robots.txt points at the sitemap');
ok((await (await get('/.well-known/security.txt')).text()).includes('Contact:'), 'security.txt is served');
ok((await get('/_next/image?url=%2Fcg-mark.png&w=64&q=75')).status === 404, 'image optimizer endpoint is off');
const og = await get('/opengraph-image');
ok(og.status === 200 && (og.headers.get('content-type') ?? '').includes('image/png'), 'Open Graph image renders');

// the form's backend must accept the production origin (preflight only; nothing is submitted)
const homeCsp = (await get('/')).headers.get('content-security-policy') ?? '';
const supa = (homeCsp.match(/https:\/\/[a-z0-9]+\.supabase\.co/) ?? [])[0];
ok(!!supa, 'CSP names the Supabase project (NEXT_PUBLIC_SUPABASE_URL was set at build time)');
if (supa) {
  const pre = await fetch(`${supa}/functions/v1/submit-enquiry`, { method: 'OPTIONS', headers: { Origin: 'https://www.configrow.in', 'Access-Control-Request-Method': 'POST', 'Access-Control-Request-Headers': 'content-type' } });
  ok(pre.status === 204 && pre.headers.get('access-control-allow-origin') === 'https://www.configrow.in', 'enquiry endpoint allows https://www.configrow.in');
}

console.log(failed ? `\n${failed} check(s) FAILED` : '\nAll checks passed');
process.exit(failed ? 1 : 0);
