# Configrow — 3D scrollytelling website (Next.js + Supabase)

Next.js 14 (App Router) · React 18 · Three.js / React Three Fiber · GSAP ScrollTrigger · Lenis · TypeScript · Supabase (database + Edge Function) · WhatsApp Cloud API

> Status: rebuilt to the brief in `CLAUDE.md`. `npm run build`, `npm run typecheck` and the Playwright suite pass. The Supabase function and WhatsApp alerts are verified only against mocked responses; they still need a live test with your accounts (see `supabase/README.md`, step 8).

## Run locally
```bash
npm install
cp .env.local.example .env.local      # fill in your Supabase URL + anon key
npm run dev                           # http://localhost:3000
npm run build && npm test             # production build + Playwright checks (first time: npx playwright install chromium)
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
app/            layout.tsx, page.tsx (home), pricing/ faq/ privacy/ terms/, not-found.tsx, sitemap.ts, robots.ts, opengraph-image.tsx, globals.css (tokens + all styling)
components/
  layout/       Header (floating bar, hides in the Promise pin, accessible mobile menu), Footer, ProgressBar, SmoothScroll (Lenis), SpecularButton
  Scene.tsx, SceneLoader.tsx (R3F canvas, WebGL check + error boundary), ScrollDirector.tsx (drives the logo, one scrubbed timeline per chapter)
  sections/     Hero, Services (+ServicesMotion), Promise, Growth, Enquiry
  pricing/      PricingStory (pricing 3D story)
lib/            scene.ts (keyframes + shared thresholds), scroll.ts (DOM-derived scroll ranges), story.ts (pricing timeline units), sceneState.ts,
                buildRig.ts, markData.ts, dispose.ts, plans.ts (prices + features), legalHtml.ts
supabase/       migration, Edge Function, config snippet, README, secrets example
tests/          Playwright specs (layout, static pages, Services timing, home chapters, pricing story, form, accessibility)
prototype/      the approved HTML prototypes, for visual reference
public/         cg-mark.png, logo-original.svg
```

## How scrolling is wired (no magic numbers)
- Heights live only in CSS (`#services` 250vh, `#promise` 300vh). JS never repeats them.
- `lib/scroll.ts` gives two ranges read from each section's own element: **enter** (section top travels bottom to top of the viewport) and **pin** (sticky stage held).
- `ScrollDirector.tsx` has one scrubbed timeline per chapter; each tween is `fromTo(previous chapter's end values to this chapter's)` using `keyframes()` in `lib/scene.ts`, so chapters can't fight over a value.
- Services cards: one scrubbed timeline over the pin (`ServicesMotion.tsx`), windows in `lib/scene.ts` (head 0-.06, cards .06-.30 / .34-.58 / .62-.86). Promise thresholds (`PROMISE_STEPS`) are shared by the scene glow and the DOM nodes.
- Pricing: `lib/story.ts` holds the unit lengths; the stage height is computed from them (`stageHeightVh`).

## Brand
Colours: #00091b (main), #0652dd (accent, used sparingly), white text. Font: Inter (+ JetBrains Mono for small labels).
Contact: www.configrow.in · info@configrow.in · +91 94809 33776 · Instagram @configrow.dev
