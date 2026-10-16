import type { Metadata } from 'next';

export const SITE = 'https://www.configrow.in';
export const BRAND = 'Configrow';
export const PHONES = ['+91 94809 33776', '+91 78923 17834'];
export const SOCIALS = ['https://www.youtube.com/@Configrow.01', 'https://x.com/Configrow_01', 'https://www.instagram.com/configrow.in'];
// A page that sets its own openGraph does not inherit the root file-based image, so it is attached explicitly.
const OG_IMAGE = { url: '/opengraph-image', width: 1200, height: 630, alt: 'Configrow: Great websites build trust.' };
export const DEFAULT_DESCRIPTION = 'Configrow builds premium, SEO-ready websites for local businesses, designed to earn trust and generate leads. HTML, Next.js / Node.js and PHP development.';

/** Renders one JSON-LD block in the server HTML. */
export function JsonLd({ data }: { data: object }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, '\\u003c') }} />;
}

/** Per-page metadata with matching canonical, Open Graph and Twitter tags (title is the page's own, the layout template adds the brand). */
export function pageMeta(path: string, title: string, description: string): Metadata {
  const url = SITE + path;
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: { type: 'website', siteName: BRAND, locale: 'en_IN', url, title: `${title} | ${BRAND}`, description, images: [OG_IMAGE] },
    twitter: { card: 'summary_large_image', title: `${title} | ${BRAND}`, description, images: [OG_IMAGE.url] },
  };
}

export const breadcrumb = (items: { name: string; path: string }[]) => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [{ name: 'Home', path: '/' }, ...items].map((it, i) => ({ '@type': 'ListItem', position: i + 1, name: it.name, item: SITE + it.path })),
});

const strip = (html: string) => html.replace(/<[^>]+>/g, ' ').replace(/&#39;|&#x27;/g, "'").replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim();

/** FAQPage structured data built from the same HTML the page renders, so it can never drift from the visible answers. */
export function faqJsonLd(html: string) {
  const items = html.split('<details>').slice(1).map((d) => {
    const q = d.match(/<summary>([\s\S]*?)<\/summary>/)?.[1] ?? '';
    const a = d.split('</summary>')[1]?.split('</details>')[0] ?? '';
    return { '@type': 'Question', name: strip(q), acceptedAnswer: { '@type': 'Answer', text: strip(a) } };
  });
  return { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: items };
}
