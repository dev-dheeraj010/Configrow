import type { Metadata } from 'next';
import LegalPage from '@/components/LegalPage';
import { PRIVACY_HTML } from '@/lib/legalHtml';

export const metadata: Metadata = { title: 'Privacy Policy', description: 'How Configrow handles personal information.', alternates: { canonical: '/privacy' } };
export default function Page() { return <LegalPage label="LEGAL" title="Privacy Policy" updated="October 16, 2026" html={PRIVACY_HTML} />; }
