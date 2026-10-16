import type { MetadataRoute } from 'next';

const SITE = 'https://www.configrow.in';
// bump when page content changes (an honest lastmod helps crawlers; a new Date() on every request does not)
const LAST_UPDATED = new Date('2026-10-16');
const ROUTES = ['', '/pricing', '/faq', '/privacy', '/terms'];

export default function sitemap(): MetadataRoute.Sitemap {
  return ROUTES.map((r) => ({ url: SITE + r, lastModified: LAST_UPDATED, changeFrequency: 'monthly', priority: r === '' ? 1 : 0.7 }));
}
