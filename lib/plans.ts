export type Plan = { n: string; p: number; h: string; rec?: boolean; f: string[] };

export const PLANS: Plan[] = [
  { n: 'Foundation', p: 10999, h: '+ hosting',
    f: ['Basic SEO-friendly structure', 'Mobile-friendly responsive layout', 'User-friendly navigation', 'Essential pages included', 'Contact form', 'Clean modern design', 'Basic performance setup'] },
  { n: 'Standard', p: 14549, h: 'including free hosting for 1 year', rec: true,
    f: ['Improved UI/UX design', 'Additional pages and sections', 'Enhanced SEO setup', 'Responsive mobile-first design', 'Stronger performance optimisation', 'Enquiry/contact features', 'Additional functionality'] },
  { n: 'Next-gen', p: 19999, h: 'including free hosting for 1 year',
    f: ['Fully custom professional 3D website', 'Advanced UI/UX design', 'Advanced SEO integration', 'High-performance responsive experience', 'Sophisticated features & integrations', 'Scalable setup', 'Maintenance & support-ready', 'Multiple hosting support'] },
];
