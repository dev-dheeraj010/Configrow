import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = { title: 'Page not found', robots: { index: false } };

export default function NotFound() {
  return (
    <main id="content" className="page nf">
      <i /><i /><i />
      <div className="k" style={{ position: 'relative', zIndex: 1 }}>PAGE NOT FOUND</div>
      <div className="big">4<b>0</b>4</div>
      <h1>This page took a wrong turn<b>.</b></h1>
      <p>The page you&apos;re looking for doesn&apos;t exist or has moved.</p>
      <div className="bt">
        <Link href="/">Back to home</Link>
        <Link href="/pricing">See pricing</Link>
        <Link href="/faq">Read the FAQ</Link>
      </div>
    </main>
  );
}
