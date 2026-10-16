import type { Metadata } from 'next';
import PricingStory from '@/components/pricing/PricingStory';

export const metadata: Metadata = { title: 'Pricing — Configrow', description: 'Foundation, Standard and Next-gen website plans from Configrow.' };

export default function Pricing() {
  return <PricingStory />;
}
