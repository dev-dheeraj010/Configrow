# Deploying Configrow to Hostinger (Node.js Web App)

Repo: https://github.com/dev-dheeraj010/Configrow  (branch `main`)

## 0. Before you start (5 minutes)
- You need a Hostinger plan that includes **Node.js Web Apps** (Business / Cloud). hPanel -> Websites -> Add website should offer "Node.js Apps".
- Have these ready (leave any you don't have yet blank; the site still works, see the table):

| Variable (hPanel -> Environment variables) | Value | Needed? |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://lmgykdhjhzafwbioehom.supabase.co` | **Yes** (form) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | the anon / publishable key from Supabase -> Settings -> API | **Yes** (form) |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | public site key from Cloudflare Turnstile | Recommended |
| `NEXT_PUBLIC_GA_ID` | GA4 measurement ID `G-XXXXXXXXXX` | Optional |
| `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` | token from Search Console | Optional |
| `NEXT_PUBLIC_BING_SITE_VERIFICATION` | token from Bing Webmaster | Optional |

**Important:** `NEXT_PUBLIC_*` values are baked into the site **at build time**. Add them *before* the first build, and trigger a **redeploy** whenever you change one. Never put the Supabase `service_role` key, the WhatsApp token, the Resend key or the Turnstile *secret* here; those live only in Supabase (`npx supabase secrets set ...`).

## 1. Create the app
1. hPanel -> **Websites -> Add website -> Node.js Apps** -> **Import Git repository** -> authorise GitHub -> choose `dev-dheeraj010/Configrow`, branch `main`.
2. Settings (usually auto-detected as Next.js):
   - Framework: **Next.js**
   - Node.js version: **22.x** (20.9+ also works)
   - Install command: `npm ci`
   - Build command: `npm run build`
   - Start command: `npm start`
   - Entry/root directory: repository root
3. Add the environment variables from the table, then **Deploy**.
4. Wait for the build to finish (2-4 minutes). Open the temporary URL Hostinger gives you and run the smoke test (section 4) against it.

## 2. Connect the domain
1. hPanel -> the app -> **Domains** (or Domains -> DNS Zone): connect `www.configrow.in` and `configrow.in`.
2. If the domain is registered at Hostinger it points automatically; otherwise add the records Hostinger shows (usually an `A` record for `@` and a `CNAME` for `www`) at your registrar.
3. Turn on the free **SSL** certificate and **Force HTTPS**.
4. Make `www.configrow.in` the primary and redirect `configrow.in` -> `https://www.configrow.in` (301). Canonical URLs and the sitemap all use `www`.
5. DNS can take from minutes to a few hours.

## 3. Things that must be updated once the live URL exists
- **Supabase function CORS:** already allows `https://www.configrow.in` and `https://configrow.in`. If you also use the temporary Hostinger URL for testing, add it: `npx supabase secrets set ALLOWED_ORIGINS="https://www.configrow.in,https://configrow.in,https://YOUR-TEMP-URL"` (remove it again after launch).
- **Cloudflare Turnstile:** add `www.configrow.in` and `configrow.in` as allowed hostnames.
- **Google Search Console:** add the property, verify with `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION`, submit `https://www.configrow.in/sitemap.xml` (see `SEO.md`).
- **Alerts:** until email (Resend) or WhatsApp is live, check the `enquiries` table in Supabase daily.

## 4. Smoke test (run after every deploy)
```bash
node scripts/smoke.mjs https://www.configrow.in
```
It checks: every page returns 200 with its real text in the HTML, one `h1` per page, canonical/OG tags, structured data, sitemap + robots, security headers and CSP, no `X-Powered-By`, `security.txt`, the 404 page, and that the enquiry endpoint answers its CORS preflight for the production origin. It exits non-zero on any failure. It sends no enquiry.

## 5. Updating the site
Push to `main`. CI (GitHub Actions) must pass, then redeploy in hPanel (or enable auto-deploy on push if your plan offers it). Never edit files on the server.

## 6. If something goes wrong
- **White page / 500:** hPanel -> app -> Logs. Most often a missing `NEXT_PUBLIC_*` variable at build time: add it and redeploy.
- **Form says "We couldn't send that":** `NEXT_PUBLIC_SUPABASE_URL` is wrong/missing at build time, or the origin isn't in `ALLOWED_ORIGINS`.
- **Form button stays disabled:** the Turnstile site key is set but the domain isn't allowed in Cloudflare.
- **Styles/JS missing or 404s on `/_next/...`:** the build didn't finish; redeploy.
- **Rollback:** redeploy the previous commit from hPanel.
