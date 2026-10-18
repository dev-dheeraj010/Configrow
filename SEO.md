# Configrow SEO guide

## On-page (done in code, verified by `tests/m8-seo.spec.ts`)
- **Server-rendered.** Every page ships its full text in the first HTML response (home chapters, all pricing text and plan features, FAQ, Terms, Privacy). Only the 3D canvas is client-only, and it is decorative. The test reads raw HTML with no JavaScript.
- **Per-page metadata:** unique title (under 70 characters), description (70-200), canonical URL, Open Graph and Twitter cards with the 1200x630 image, `en-IN` language, theme colour, `robots` allowing large previews.
- **Structured data (JSON-LD):** `Organization` + `ProfessionalService` and `WebSite` on every page (name, logo, email, both phones, YouTube/X/Instagram `sameAs`); `FAQPage` built from the visible FAQ text; `ItemList` of the three plans with real prices in INR, generated from `lib/plans.ts`; `BreadcrumbList` on every sub-page.
- **Structure:** one `h1` per page, a clean heading outline, semantic landmarks, alt text on images, skip link, fast fonts (`next/font`), `/sitemap.xml`, `/robots.txt`, no `X-Powered-By`.
- **Single sources of truth:** prices live in `lib/plans.ts`; FAQ answers live in `lib/legalHtml.ts`. The page, the JSON-LD and the tests all read from those.

## Before launch (needs you)
1. Set `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` (and optionally `NEXT_PUBLIC_BING_SITE_VERIFICATION`) in Vercel. They become the ownership meta tags automatically.
2. In **Google Search Console** add the `https://www.configrow.in` property, verify it, submit `https://www.configrow.in/sitemap.xml`, and request indexing for `/`, `/pricing`, `/faq`.
3. In **Bing Webmaster Tools** import the site from Search Console.
4. Make sure `configrow.in` redirects to `https://www.configrow.in` (301) in Vercel domain settings, so links are not split.
5. Fill the open `[[gap]]` markers (Privacy page: grievance officer, registered address). Add a physical address to the `Organization` schema only if you want one shown publicly.

## Off-page (cannot be done in code; do these in order)
**Week 1: foundations**
- **Google Business Profile.** Create it as a service-area business. Use exactly the same name, phone (+91 78923 17834) and email as the site. Add the website, services (HTML, Next.js / Node.js, PHP web development), and photos of work you have delivered.
- **Consistent profiles.** Make the name, one-line description and link identical on YouTube, X and Instagram, and put `https://www.configrow.in` in each bio. These already appear in the site's `sameAs`, which links them to the brand.
- **Business listings (free):** Justdial, Sulekha, IndiaMART, Clutch, GoodFirms, LinkedIn company page. Keep the name, phone and email identical everywhere.

**Weeks 2-8: earn links and trust**
- Ask each client for a Google review and a link from their new site's footer ("Website by Configrow"). Local businesses you serve are your best source of relevant backlinks.
- Publish short project write-ups with the client's permission (what the business needed, what you built). Post them on LinkedIn and Instagram and link back to `/pricing`.
- Answer local-business web questions on Quora and Reddit with useful advice and a link only where it genuinely helps.
- Guest posts or interviews on small-business and startup blogs, and local business groups (chambers, WhatsApp/LinkedIn communities) in the cities you target.

**Ongoing**
- Check Search Console monthly: coverage errors, queries, click-through rate. Rewrite titles and descriptions for pages with impressions but few clicks.
- Add one useful page per month once you have projects to show (for example "Website for a dental clinic: what to include"). Each new page needs an entry in `app/sitemap.ts`.
- Do not buy links or use link farms; they risk a manual penalty.

## Things not to expect
- Rankings depend on competition and time (typically 2-6 months for new pages). Nothing here guarantees a position, and the site makes no such promise.
- The brand copy is deliberately short and visual. If you want to rank for specific searches (for example "website designer in [city]"), add a short on-page section or separate page for that service area, written by you, and add the city to the Google Business Profile.
