'use client';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { CONSENT_OPEN, getConsent, setConsent } from '@/lib/consent';

/**
 * Cookie banner. Shown until the visitor chooses; "Essential only" and "Accept all" are equally prominent.
 * It never blocks the page (non-modal) and never steals focus on first load; when re-opened from the footer it takes focus.
 */
export default function CookieConsent() {
  const [open, setOpen] = useState(false);
  const box = useRef<HTMLDivElement>(null);
  const reopened = useRef(false);

  useEffect(() => {
    setOpen(getConsent() === null);
    const reopen = () => { reopened.current = true; setOpen(true); };
    window.addEventListener(CONSENT_OPEN, reopen);
    return () => window.removeEventListener(CONSENT_OPEN, reopen);
  }, []);

  useEffect(() => {
    if (open && reopened.current) box.current?.querySelector<HTMLElement>('button')?.focus();
  }, [open]);

  if (!open) return null;
  const choose = (analytics: boolean) => { setConsent(analytics); setOpen(false); reopened.current = false; };

  return (
    <div className="cc" role="dialog" aria-modal="false" aria-labelledby="cc-t" aria-describedby="cc-d" ref={box}>
      <h2 id="cc-t" className="cc-t">Cookies</h2>
      <p id="cc-d" className="cc-d">
        We use essential cookies to make this site work. With your permission we also use analytics cookies (Google Analytics) to see how the site is used.
        You can change this any time from <strong>Cookie settings</strong> in the footer. <Link href="/privacy" className="ul">Privacy Policy</Link>
      </p>
      <div className="cc-b">
        <button type="button" onClick={() => choose(false)}>Essential only</button>
        <button type="button" onClick={() => choose(true)}>Accept all</button>
      </div>
    </div>
  );
}
