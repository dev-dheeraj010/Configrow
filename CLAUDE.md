# CLAUDE.md — Configrow website

## Who and what
Configrow is a web development agency for local businesses. It sells premium, SEO-ready websites built for lead generation. This repo is Configrow's own marketing website. Brand promise: *"Great websites build trust. Trust drives leads. Leads grow businesses."*
- Site: www.configrow.in · Email: info@configrow.in · Phone: +91 94809 33776 · Instagram: instagram.com/configrow.in · YouTube: @Configrow.01 · X: @Configrow_01
- Services: HTML Web Development · Next.js / Node.js · PHP Web Development · App development (coming soon)
- Founders: Praadhyun Sai H (Marketing and Sales), Dheeraj Murthy (Development). Do not put founder names on the site unless asked.

## Stack (fixed)
Next.js 14 App Router · React 18 · TypeScript (strict) · Three.js via React Three Fiber (home) · GSAP + ScrollTrigger · Lenis · plain CSS in app/globals.css with CSS variables (no Tailwind) · Supabase (Postgres + Edge Function) · WhatsApp Cloud API · deploy on Vercel.

## Design system
- Colours: background **#00091b** (dominant), text #f2f5fb, muted rgba(242,245,251,.6), hairlines rgba(242,245,251,.14). Accent **#0652dd used sparingly**: full stops on headlines, the logo mark, the top progress line, CTAs. Provide a light-theme variant via prefers-color-scheme.
- Type: **Inter** (300/500/700) and **JetBrains Mono** for small labels. Headlines uppercase, bold, tight (-0.04em), line-height ~.95, ending in an accent-coloured full stop. Section labels like `02 — SERVICES` in mono, 11px, letter-spacing .18em.
- Style: clean editorial, lots of space, hairline dividers, almost no boxes. Reference feel: quivane.in.
- Logo: the "CG" mark (C flowing into G with an up-right arrow), grey→blue gradient, on a dark rounded tile. Assets: public/cg-mark.png (transparent), public/logo-original.svg, traced outline in lib/markData.ts.
- **Specular button** (used for "Send enquiry" and the header CTA): radius 18 (12 for small), tint #fff at 4%, text #f5f5f5, line #0061ff, base #0053da, thickness 1.2px, border highlight with core 10px and fade 34px, outer glow, idle intensity .35 rising to 1 as the pointer comes within 250px, highlight follows the pointer around the border.

## Things Configrow already rejected. Do NOT add
No ambient star/particle field (the only particles allowed are the white "lead" particles in the Growth chapter) · no marquee/carousel strips · no chapter counter · no hover animation on nav links (plain brighten only) · no pill backgrounds on nav links · no big blue glows or lots of blue · no "Choose plan" buttons on the final pricing cards · no founder photos or stock imagery · never invent prices, stats, testimonials or legal clauses (use [[gap]] markers).

## Header (identical size and position on every page)
Floating rounded bar: height 60px, width min(1240px, 100% − 32px), top 14px, radius 20, hairline border, blurred background. Logo mark left (26px tall), plain nav links right (Services, Promise, About, Pricing, FAQ, Enquiry; active section highlighted with a small dot), then the small specular "Start a project →" button. At scroll 0 the bar is lighter; it becomes frosted after scrolling. While scrolling **down** through the pinned Promise chapter the bar slides away and a standalone "Start a project" button stays top-right; scrolling up brings the bar back. Under 800px: logo, CTA and a hamburger opening a full-screen menu (links + Close; Escape closes; body scroll locked).

## Footer
Four columns: tagline "Premium websites that turn visitors into leads." · MENU (Services, Promise, About, Pricing, Enquiry, FAQ) · CONNECT (blue icon buttons: YouTube, X, Instagram) · CONTACT (email, both phones: +91 94809 33776 and +91 78923 17834, website). Bottom bar: wide-spaced CONFIGROW wordmark, © 2026 CONFIGROW — ALL RIGHTS RESERVED, FAQ · Privacy Policy · Terms and Conditions.

## Home page / — "The Build" scrollytelling
One fixed 3D scene behind the page. The hero object is the CG logo: a rounded tile (extruded) with the extruded traced mark in front (grey→blue vertex colours), a thin glowing rim, wireframe edges, two orbit rings, a halo sprite, a blueprint grid, and 360 white "lead" particles. It changes with scroll: **Blueprint** (wireframe over a perspective grid, camera tilted down) → **Build** (faces fill in, solid and lit, grid fades) → **Launch** (glow steps up with each promise, rings fade out while the hub plays and return after) → **Growth** (lead particles stream out) → calm for the enquiry.

Sections (all copy exact):
1. **Hero** (100vh). Label WEB STUDIO · FOR LOCAL BUSINESSES, H1 "Great websites build trust." , sub "Premium, SEO-ready websites made to generate leads.", button "Start a project →". Logo parked on the right (~75% across, 85% size) so it never touches the text.
2. **Services** (pinned, ~250vh). Label 02 — SERVICES, H2 "Built for real results.", "We craft clean, premium, high-converting websites for local businesses." On the right a stack of three tilted 3D glass cards (perspective 1400px, rotateY −18° rotateX 8°, **fixed 420px wide**, min-heights 230/230/210, offsets left 0/150/280px and top 0/200/400px, blue-edged glass with soft glow, slight lift on hover): 01 HTML Web Development "Fast, SEO-ready pages made to turn visitors into leads." · 02 Next.js / Node.js "Modern full-stack builds, optimized for peak performance." · 03 PHP Web Development "Reliable, cross-platform sites for local businesses." A dashed pill bottom-left: APP DEVELOPMENT — COMING SOON. The logo sits just left of centre, partly behind the glass.
3. **Promise** (pinned, 300vh). Label 03 — THE CONFIGROW WAY, H2 "What makes us Configrow.", "Five promises. One standard." The 3D logo is the centre tile (scale .55, spins once as it arrives). Five rounded-square nodes sit on a pentagon around it (angles −90, −18, 54, 126, 198°; Rx = min(28% of width, 430px), Ry = min(25% of height, 250px)) with labels: Exquisite design language · Optimized for peak performance · Google-optimized websites · Cross-platform designs · Continuous care, zero compromise. Thin curved lines run from the **edge of the logo tile** (not from the orbit ring) to each node. Nodes light up one by one on scroll (thresholds at 10%, 27%, 44%, 61%, 78% of the pin); each active line shows a white pulse flowing **outward** from the tile, 1.3s loop, staggered .26s. At 90% fade in the payoff "The Configrow standard." Phones: promises become a list that lights up in turn, no lines.
4. **Growth** (100vh). Label 04 — WHY WE EXIST, H2 "Trust drives leads. Leads grow businesses.", "Our mission: help local businesses scale their online presence with confidence through premium websites that generate leads and drive real growth." Logo on the right, lead particles streaming out.
5. **Enquiry** (100vh). Label 05 — NEXT STEP, H2 "Let's build something extraordinary.", form (below), then "Not sure which plan fits? See our pricing →". Logo on the left, calm.

### Known bug to fix first: Services card timing
The old cards appeared at the wrong moments because their entrance was time-based (play/reverse at scroll thresholds) while the 3D scene was scrubbed by a global timeline whose "units" were hard-coded section heights. Rebuild like this:
- Drive **everything from each section's own ScrollTrigger** (start/end taken from the DOM). No global timeline with magic height constants.
- In Services, build one **scrubbed** timeline (scrub ≈ 0.6) over the pinned range: heading and intro fade in over progress 0–0.06; card 1 enters over 0.06–0.30, card 2 over 0.34–0.58, card 3 over 0.62–0.86; hold 0.86–1. Each card animates from {opacity 0, x 90, y 70, scale .94} to rest with power3.out. Scrolling back must reverse exactly.
- The logo move for this chapter (drift left, fill in) must finish before card 1 starts and use the same trigger, so cards and logo never fight.
- Verify with Playwright screenshots at progress 0, .1, .2, .3, .4, .5, .6, .7, .85, 1 and fix until each card appears alone, in order, with no overlap or jump.

## Pricing page /pricing — 3D scrollytelling (stage height ≈ 1380vh, pinned canvas)
Data (single source in lib/plans.ts), prices in INR with Indian grouping:
- **Foundation** ₹10,999 + hosting: Basic SEO-friendly structure · Mobile-friendly responsive layout · User-friendly navigation · Essential pages included · Contact form · Clean modern design · Basic performance setup
- **Standard** (RECOMMENDED) ₹14,549 including free hosting for 1 year: Improved UI/UX design · Additional pages and sections · Enhanced SEO setup · Responsive mobile-first design · Stronger performance optimisation · Enquiry/contact features · Additional functionality
- **Next-gen** ₹19,999 including free hosting for 1 year: Fully custom professional 3D website · Advanced UI/UX design · Advanced SEO integration · High-performance responsive experience · Sophisticated features & integrations · Scalable setup · Maintenance & support-ready · Multiple hosting support

Story (timeline units of 100vh): intro "Three plans. One standard." fades out first. For each plan (block length 3.7): the glowing capsule name appears with a 3D object that builds (Foundation = single tile; Standard = three stacked tiles, "RECOMMENDED" label, brighter capsule; Next-gen = full glowing logo with two rings) → features come in **one per scroll step, each wiping in from a blur (x −40, blur 8px, clip-path inset)** → the price counts up to its value and **stays on screen for at least 0.7 of a screen** → the view zooms out to 1.7×, pans left and returns to 1× as the next plan enters. After Next-gen: pull back to 2.4×, then settle on the finale: the 3D objects fade away and **three tall rectangles** show name, price, hosting note and features (Standard raised and marked RECOMMENDED), with "Not sure what's right for you?" and "Your answer is just a ring away." above a pulsing-rings button "Call +91 94809 33776". A "Skip to plans ↓" control, a small left rail "01 FOUNDATION / 02 STANDARD / 03 NEXT-GEN", and always start from the top on revisit (history.scrollRestoration = 'manual'). Phones: text at the bottom, rectangles show name and price only.

## Static pages
/faq (accordion), /privacy, /terms, custom not-found (outlined 404 with pulsing rings, buttons: Back to home, See pricing, Read the FAQ). Keep the copy in lib/legalHtml.ts; text written [[like this]] renders highlighted yellow as a gap for Configrow to fill. Privacy and Terms carry a removable "draft, have a lawyer review" notice. They are templates, not legal advice.

## Backend (Supabase + WhatsApp). Reuse supabase/
- Table enquiries: name, phone (required), email (optional), message, source_page, status (new/contacted/won/lost/spam), notes, whatsapp_sent, whatsapp_error, ip_hash, user_agent. RLS on, no public policies.
- Edge Function submit-enquiry (verify_jwt off): validate, honeypot field `website`, max 5 per hour per hashed IP, insert with the service role, then notify in the background. Never fail the user if WhatsApp fails.
- WhatsApp Cloud API template new_enquiry (Utility, en): "New Configrow enquiry from {{1}}. Phone: {{2}}. Email: {{3}}. About their business: {{4}}. Received: {{5}}", sent to **919480933776** and **917892317834**; optional email copy to info@configrow.in via Resend.
- Form fields: Name (required), Phone / WhatsApp (required), Email (optional), About your business. States: sending, sent ("Thanks! We've got your enquiry and will call or WhatsApp you shortly."), error (fallback to phone/email).

## Engineering quality bar
- TypeScript strict, no any outside the Three.js glue. `npm run build` and `tsc --noEmit` must pass.
- Respect prefers-reduced-motion (no Lenis, no pulses, static states). Keyboard-accessible menu, accordion and form; visible focus; contrast ≥ 4.5:1 for text.
- Under 800px: no pinned horizontal camera moves; simplified layouts as described. Cap pixel ratio at 2. Dispose Three.js resources on unmount. If WebGL fails, show the text content only.
- SEO: metadata per page, one H1 per page, semantic HTML, all pricing text real DOM text, sitemap + robots, OG image.
- All scroll mappings derived from DOM positions, never magic numbers. Comment every timeline with its scroll map.

## Working method
Plan first, then milestone by milestone with a git commit each: (1) tokens, layout, header, footer, smooth scroll; (2) static pages and 404; (3) home 3D scene and chapters, including the Services timing fix; (4) pricing story; (5) Supabase + form; (6) polish, accessibility, performance, README. After each milestone run the build, take Playwright screenshots at 1440×900, 1100×800 and 390×844, and show what was checked. Ask before changing anything in "Things Configrow already rejected". If something is unclear, ask one concise question rather than guessing. Treat prototype/*.html as the visual source of truth; existing code is reference only.
