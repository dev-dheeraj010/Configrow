import LegalPage from '@/components/LegalPage';
import { PRIVACY_HTML } from '@/lib/legalHtml';
import { JsonLd, breadcrumb, pageMeta } from '@/lib/seo';

export const metadata = pageMeta('/privacy', 'Privacy Policy', 'How Configrow collects, uses and protects personal information under the DPDP Act, 2023 and the IT Act, 2000.');
export default function Page() {
  return (<><JsonLd data={breadcrumb([{ name: 'Privacy Policy', path: '/privacy' }])} /><LegalPage label="LEGAL" title="Privacy Policy" updated="October 16, 2026" html={PRIVACY_HTML} /></>);
}
