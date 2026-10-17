# Security

No website is "unhackable". This site is built to keep the attack surface small, make abuse expensive, and fail safely. This file says what is in place, what is not covered, and what only you can do.

## What is in place
**Attack surface**
- Mostly static, server-rendered pages. No login, no user accounts, no admin panel, no file uploads, no user-generated content shown to other visitors.
- The only write path is the enquiry form -> Supabase Edge Function. The browser never talks to the database directly.
- Next.js 15.5.x, React 19; `npm audit` clean (0 vulnerabilities). Image-optimizer endpoint disabled. Dependabot + CI audit keep it that way.

**Browser-side defences** (`next.config.mjs`, verified by `tests/m9-security.spec.ts`)
- Content-Security-Policy (no plugins, no framing, no foreign form targets, connections only to this site, Supabase, Cloudflare Turnstile and Google Analytics), HSTS (2 years), `X-Frame-Options: DENY`, `nosniff`, strict referrer policy, Permissions-Policy (camera, mic, location, payment off), COOP `same-origin`. No `X-Powered-By`.
- No `eval`; the only `dangerouslySetInnerHTML` renders our own static legal/FAQ text and JSON-LD (escaped).
- Optional analytics (Google Analytics 4) load only after consent; consent is a first-party cookie.

**Enquiry form + Edge Function** (`supabase/functions/submit-enquiry`, abuse-tested against the live function)
- Cloudflare Turnstile token verified server-side; hidden honeypot; JSON only; 16 KB body cap (streamed, so a lying Content-Length doesn't help); allowed origins only.
- Input cleaned (control characters stripped, phone/email/source-page validated); stored as plain data, never rendered as HTML.
- 5 stored enquiries per visitor per hour (hashed, salted IP from Cloudflare's header, not the spoofable one); identical enquiry within 10 minutes is acknowledged but not re-stored or re-sent; WhatsApp is capped at 40 messages/hour so spam cannot run up your Meta bill (extra enquiries are still saved).
- Errors are generic; internal details stay in the table's `whatsapp_error` column, which only you can read.

**Database** (`supabase/migrations`)
- Row Level Security on, all access for `anon`/`authenticated` revoked, so the public anon key can read and write nothing. The Supabase security advisor reports no issues.
- Future tables get no automatic public access; the helper function flagged by the advisor is no longer callable from the web.

**Secrets**
- Nothing secret is in git (`.env.local` ignored; CI runs a secret scan). The WhatsApp token, Turnstile secret and IP salt exist only as Supabase secrets.
- Only values meant to be public use `NEXT_PUBLIC_` (Supabase URL + anon key, Turnstile site key, GA id).

## What is NOT covered (the realistic risks)
1. **Account takeover.** Whoever controls your GitHub, Hostinger, Supabase, Meta, Cloudflare, Google or domain-registrar account controls the site. This is how small sites are actually lost.
2. **Phishing and social engineering** of the founders.
3. **Hostinger's shared infrastructure** is theirs to patch; keep the Node.js version current in hPanel.
4. **Zero-days** in dependencies between releases. Dependabot and a monthly `npm audit` reduce the window.
5. **A determined DDoS** is absorbed by Hostinger/Cloudflare, not by this code.

## Checklist for you (30 minutes, do once)
- [ ] 2-factor authentication (app or hardware key, not SMS where possible) on: GitHub, Hostinger, Supabase, Meta/Facebook (+ Business Manager), Cloudflare, Google (Search Console/Analytics), the domain registrar, and the email account that receives resets (info@configrow.in).
- [ ] Unique, long passwords in a password manager. Never share them in chat, email or WhatsApp.
- [ ] Meta: use a **system user** token with only `whatsapp_business_messaging` + `whatsapp_business_management`; two admins on the Business account so you can't be locked out.
- [ ] Supabase: Authentication -> Sign In / Providers -> turn off "Allow new users to sign up" (nothing uses it). Keep the `service_role` key out of every file and chat.
- [ ] GitHub: private repo, branch protection on `main` (require CI to pass), secret scanning + push protection on, no tokens in the repo.
- [ ] Hostinger: enable auto-renew on the domain and lock it (registrar lock); keep Node.js on a supported LTS.
- [ ] If a token ever leaks: revoke it in Meta/Supabase immediately, set a new one with `npx supabase secrets set`, and check the `enquiries` table for odd rows.

## Reporting a vulnerability
Email info@configrow.in (also in `/.well-known/security.txt`).
