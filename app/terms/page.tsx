import LegalPage from '@/components/LegalPage';
import { TERMS_HTML } from '@/lib/legalHtml';
import { JsonLd, breadcrumb, pageMeta } from '@/lib/seo';

export const metadata = pageMeta('/terms', 'Terms and Conditions', 'The terms that apply when you use configrow.in or engage Configrow: intellectual property, acceptable use, refunds, hosting and renewal.');
export default function Page() {
  return (<><JsonLd data={breadcrumb([{ name: 'Terms and Conditions', path: '/terms' }])} /><LegalPage label="LEGAL" title="Terms and Conditions" updated="October 2026" html={TERMS_HTML} /></>);
}
