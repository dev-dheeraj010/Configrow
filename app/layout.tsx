import type { Metadata, Viewport } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import SmoothScroll from '@/components/SmoothScroll';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const inter = Inter({ subsets: ['latin'], weight: ['300', '500', '700'], variable: '--font-inter' });
const mono = JetBrains_Mono({ subsets: ['latin'], weight: ['400'], variable: '--font-mono' });

export const metadata: Metadata = {
  title: 'Configrow — Websites that build trust',
  description: 'Premium, SEO-ready websites for local businesses, built to generate leads.',
  icons: { icon: '/cg-mark.png' },
};
export const viewport: Viewport = { width: 'device-width', initialScale: 1, viewportFit: 'cover' };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${mono.variable}`}>
      <body>
        <SmoothScroll />
        <Header />
        {children}
        <Footer />
      </body>
    </html>
  );
}
