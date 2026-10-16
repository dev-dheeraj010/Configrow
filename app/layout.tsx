import type { Metadata, Viewport } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import SmoothScroll from '@/components/layout/SmoothScroll';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import ProgressBar from '@/components/layout/ProgressBar';

const inter = Inter({ subsets: ['latin'], weight: ['300', '500', '700'], variable: '--font-inter' });
const mono = JetBrains_Mono({ subsets: ['latin'], weight: ['400'], variable: '--font-mono' });

const SITE = 'https://www.configrow.in';
export const metadata: Metadata = {
  metadataBase: new URL(SITE),
  title: { default: 'Configrow — Websites that build trust', template: '%s | Configrow' },
  description: 'Premium, SEO-ready websites for local businesses, built to generate leads.',
  applicationName: 'Configrow',
  icons: { icon: '/cg-mark.png' },
  openGraph: { type: 'website', siteName: 'Configrow', locale: 'en_IN', url: SITE, title: 'Configrow — Websites that build trust', description: 'Premium, SEO-ready websites for local businesses, built to generate leads.' },
  twitter: { card: 'summary_large_image', title: 'Configrow — Websites that build trust', description: 'Premium, SEO-ready websites for local businesses, built to generate leads.' },
  alternates: { canonical: '/' },
};
export const viewport: Viewport = { width: 'device-width', initialScale: 1, viewportFit: 'cover' };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${mono.variable}`}>
      <body>
        <a className="skiplink" href="#content">Skip to content</a>
        <SmoothScroll />
        <ProgressBar />
        <Header />
        {children}
        <Footer />
      </body>
    </html>
  );
}
