# Configrow — 3D scrollytelling website (Next.js + Supabase)

Next.js 14 (App Router) · React 18 · Three.js / React Three Fiber · GSAP ScrollTrigger · Lenis · TypeScript · Supabase (database + Edge Function) · WhatsApp Cloud API

> Status: ported from the approved HTML prototypes in `prototype/`. It has NOT been installed, built or run yet (no network when it was generated), so expect a few small fixes on the first `npm run dev`. The Supabase function and WhatsApp alerts are also untested against live accounts.

## Run locally
```bash
npm install
cp .env.local.example .env.local      # fill in your Supabase URL + anon key
npm run dev                           # http://localhost:3000
```

## Pages
| Route | What |
|---|---|
| `/` | Home: 3D scrollytelling (Blueprint → Build → Launch → Growth), services, promises, enquiry form |
| `/pricing` | 3D scrollytelling pricing: Foundation → Standard (recommended) → Next-gen, then three plan cards and "your answer is just a ring away" |
| `/faq` · `/privacy` · `/terms` | Static pages. Copy lives in `lib/legalHtml.ts`; text written as `[[like this]]` is a gap to fill |
| any other URL | Custom 404 (`app/not-found.tsx`) |

## Deploy (Vercel)
1. Push this folder to a GitHub repo, then import it in Vercel (framework: Next.js, nothing else to configure).
2. Add the environment variables `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` (Project → Settings → Environment Variables).
3. Add the domain www.configrow.in (Project → Settings → Domains) and update the DNS records Vercel shows you.
4. Set up the backend first (below), so the enquiry form works on day one.

## Backend: Supabase + WhatsApp
Full step-by-step guide in `supabase/README.md`. In short:
- `supabase/migrations/…` creates the private `enquiries` table (name, phone, email, message, status, notes, WhatsApp result).
- `supabase/functions/submit-enquiry` validates the form, saves the row, then WhatsApps **+91 94809 33776** and **+91 78923 17834** (optional email copy to info@configrow.in).
- The form (`components/sections/Enquiry.tsx`) posts to that function. It asks for name, phone (required), email (optional) and a note about the business.

## Before launch checklist
- [ ] Supabase project created, migration pushed, function deployed, WhatsApp template `new_enquiry` approved, test enquiry received on both numbers
- [ ] Fill every `[[gap]]` in `lib/legalHtml.ts` (renewal terms, timelines, payments, refunds, address, city for disputes, grievance contact…), have a lawyer review the Privacy Policy and Terms, then remove the "draft" notice (`draft={false}` in `app/privacy/page.tsx` and `app/terms/page.tsx`)
- [ ] Lighting check on the 3D logo (the prototype used three r128, this project pins three 0.152: tune the lights in `components/Scene.tsx` if it looks too bright or dark)
- [ ] Mobile pass (<800px) and performance pass (pixel ratio, scroll lengths)
- [ ] Open Graph image, favicon set, analytics, sitemap
- [ ] "Our Work" strip once you have 1–2 shipped projects

## Structure
```
app/            layout.tsx, page.tsx (home), pricing/ faq/ privacy/ terms/, not-found.tsx, globals.css (all styling + tokens)
components/     Header (pill bar, hides in the Promise chapter, mobile menu), Footer, Scene + ScrollDirector (home 3D),
                SmoothScroll (Lenis + reveals), SpecularButton, LegalPage, pricing/PricingStory (pricing 3D), sections/*
lib/            buildRig.ts (logo + rings + grid), markData.ts (traced CG outline), sceneState.ts, plans.ts (prices + features), legalHtml.ts
supabase/       migration, Edge Function, config snippet, README, secrets example
prototype/      the approved HTML prototypes (home, pricing, FAQ/legal/404) for visual reference
public/         cg-mark.png (header + favicon), logo-original.svg
```

## Things to keep in sync
- Home timeline (`components/ScrollDirector.tsx`): `SERVICES_EXTRA` (1.5) = Services height (250vh) minus 100vh; card steps are `TH` in `components/sections/ServiceCards.tsx`; the five promise thresholds in `components/sections/Promise.tsx` (`0.1 + i*0.17`) match the glow steps in `ScrollDirector.tsx`.
- Pricing timeline (`components/pricing/PricingStory.tsx`): `T` = timeline length, `L` = length of one plan block; `#stage` height in `globals.css` is `(T + 1) × 100vh`. Change one, change the other.
- Prices and features live only in `lib/plans.ts`. The FAQ and Terms mention the same prices in text (`lib/legalHtml.ts`), so update those too.

## Brand
Colours: #00091b (main), #0652dd (accent, used sparingly), white text. Font: Inter (+ JetBrains Mono for small labels).
Contact: www.configrow.in · info@configrow.in · +91 94809 33776 · Instagram @configrow.dev
