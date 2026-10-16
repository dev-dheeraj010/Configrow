import type { MetadataRoute } from 'next';

const SITE = 'https://www.configrow.in';
const ROUTES = ['', '/pricing', '/faq', '/privacy', '/terms'];

export default function sitemap(): MetadataRoute.Sitemap {
  return ROUTES.map((r) => ({ url: SITE + r, lastModified: new Date(), changeFrequency: 'monthly', priority: r === '' ? 1 : 0.7 }));
}
