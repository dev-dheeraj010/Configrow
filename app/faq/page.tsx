import type { Metadata } from 'next';
import { gaps } from '@/components/LegalPage';
import { FAQ_HTML } from '@/lib/legalHtml';

export const metadata: Metadata = { title: 'FAQ', description: 'Answers to the questions local business owners ask before starting a website.', alternates: { canonical: '/faq' } };

export default function Faq() {
  return (
    <main id="content" className="page lw">
      <div className="k">FAQ</div>
      <h1>Questions, answered<b>.</b></h1>
      <p className="lead">Everything local business owners usually ask before starting a website. Can&apos;t find yours? Call us.</p>
      <div style={{ marginTop: 36 }} dangerouslySetInnerHTML={{ __html: gaps(FAQ_HTML) }} />
    </main>
  );
}
