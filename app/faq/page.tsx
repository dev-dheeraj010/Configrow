import { gaps } from '@/components/LegalPage';
import { FAQ_HTML } from '@/lib/legalHtml';
import { JsonLd, breadcrumb, faqJsonLd, pageMeta } from '@/lib/seo';

export const metadata = pageMeta('/faq', 'FAQ: Website Plans, Hosting, Timelines and Payments', 'Answers to the questions local business owners ask before starting a website: plans, hosting, delivery time, payments and how to get started.');

export default function Faq() {
  return (
    <main id="content" className="page lw">
      <JsonLd data={faqJsonLd(FAQ_HTML)} />
      <JsonLd data={breadcrumb([{ name: 'FAQ', path: '/faq' }])} />
      <div className="k">FAQ</div>
      <h1>Questions, answered<b>.</b></h1>
      <p className="lead">Everything local business owners usually ask before starting a website. Can&apos;t find yours? Call us.</p>
      <div style={{ marginTop: 36 }} dangerouslySetInnerHTML={{ __html: gaps(FAQ_HTML) }} />
    </main>
  );
}
