import PricingStory from '@/components/pricing/PricingStory';
import { PLANS } from '@/lib/plans';
import { BRAND, JsonLd, SITE, breadcrumb, pageMeta } from '@/lib/seo';

export const metadata = pageMeta('/pricing', 'Website Pricing: Foundation, Standard and Next-gen Plans', 'Website plans from ₹10,999: Foundation, Standard (recommended) and Next-gen. SEO-ready, mobile-friendly websites for local businesses, built to generate leads.');

/** Offers come straight from lib/plans.ts, so the structured data always matches the prices shown on the page. */
const offers = {
  '@context': 'https://schema.org',
  '@type': 'ItemList',
  name: `${BRAND} website plans`,
  itemListElement: PLANS.map((p, i) => ({
    '@type': 'ListItem',
    position: i + 1,
    item: {
      '@type': 'Service',
      name: `${p.n} website plan`,
      serviceType: 'Website development',
      provider: { '@type': 'Organization', name: BRAND, url: SITE },
      areaServed: 'IN',
      description: p.f.join('; '),
      offers: { '@type': 'Offer', price: p.p, priceCurrency: 'INR', url: `${SITE}/pricing`, description: p.h },
    },
  })),
};

export default function Pricing() {
  return (
    <>
      <JsonLd data={offers} />
      <JsonLd data={breadcrumb([{ name: 'Pricing', path: '/pricing' }])} />
      <PricingStory />
    </>
  );
}
