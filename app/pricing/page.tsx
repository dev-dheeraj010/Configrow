import type { Metadata } from 'next';
import PricingStory from '@/components/pricing/PricingStory';

export const metadata: Metadata = { title: 'Pricing', description: 'Foundation, Standard and Next-gen website plans from Configrow.', alternates: { canonical: '/pricing' } };

export default function Pricing() {
  return <PricingStory />;
}
