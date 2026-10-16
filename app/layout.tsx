import type { Metadata, Viewport } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import SmoothScroll from '@/components/layout/SmoothScroll';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import ProgressBar from '@/components/layout/ProgressBar';
import { BRAND, DEFAULT_DESCRIPTION, JsonLd, PHONES, SITE, SOCIALS } from '@/lib/seo';

const inter = Inter({ subsets: ['latin'], weight: ['300', '500', '700'], variable: '--font-inter' });
const mono = JetBrains_Mono({ subsets: ['latin'], weight: ['400'], variable: '--font-mono' });

const ORG = {
  '@context': 'https://schema.org', '@type': ['Organization', 'ProfessionalService'], '@id': `${SITE}/#org`, name: BRAND, url: SITE, logo: `${SITE}/icon.png`, image: `${SITE}/opengraph-image`,
  email: 'info@configrow.in', telephone: PHONES, sameAs: SOCIALS, areaServed: 'IN', description: DEFAULT_DESCRIPTION,
  knowsAbout: ['Web development', 'SEO-ready websites', 'Next.js', 'Node.js', 'PHP', 'Lead generation websites'],
};
const WEBSITE = { '@context': 'https://schema.org', '@type': 'WebSite', '@id': `${SITE}/#website`, url: SITE, name: BRAND, inLanguage: 'en-IN', publisher: { '@id': `${SITE}/#org` } };
const TITLE = 'Configrow: Premium SEO-ready Websites for Local Businesses';
export const metadata: Metadata = {
  metadataBase: new URL(SITE),
  title: { default: TITLE, template: '%s | Configrow' },
  description: DEFAULT_DESCRIPTION,
  applicationName: BRAND,
  keywords: ['web development agency', 'website for local business', 'SEO-ready website', 'lead generation website', 'Next.js development', 'PHP web development', 'website design India'],
  authors: [{ name: BRAND, url: SITE }],
  creator: BRAND,
  formatDetection: { telephone: true, email: true, address: false },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1, 'max-video-preview': -1 } },
  openGraph: { type: 'website', siteName: BRAND, locale: 'en_IN', url: SITE, title: TITLE, description: DEFAULT_DESCRIPTION },
  twitter: { card: 'summary_large_image', title: TITLE, description: DEFAULT_DESCRIPTION, site: '@Configrow_01' },
  alternates: { canonical: '/' },
  // Search Console / Bing ownership tokens, set in the hosting dashboard (see SEO.md); omitted when unset
  verification: { google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION, other: process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION ? { 'msvalidate.01': process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION } : undefined },
};
export const viewport: Viewport = { width: 'device-width', initialScale: 1, viewportFit: 'cover', themeColor: [{ media: '(prefers-color-scheme: dark)', color: '#00091b' }, { media: '(prefers-color-scheme: light)', color: '#eef3ff' }] };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-IN" className={`${inter.variable} ${mono.variable}`}>
      <body>
        <a className="skiplink" href="#content">Skip to content</a>
        <JsonLd data={ORG} />
        <JsonLd data={WEBSITE} />
        <SmoothScroll />
        <ProgressBar />
        <Header />
        {children}
        <Footer />
      </body>
    </html>
  );
}
