import type { Metadata } from 'next';
import LegalPage from '@/components/LegalPage';
import { TERMS_HTML } from '@/lib/legalHtml';

export const metadata: Metadata = { title: 'Terms and Conditions', description: 'The terms that apply when you use configrow.in or engage Configrow.', alternates: { canonical: '/terms' } };
export default function Page() { return <LegalPage label="LEGAL" title="Terms and Conditions" updated="11 October 2026" html={TERMS_HTML} />; }
