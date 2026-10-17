'use client';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { CONSENT_CHANGED, clearAnalyticsCookies, getConsent } from '@/lib/consent';

const GA_ID = process.env.NEXT_PUBLIC_GA_ID;

type Gtag = (...args: unknown[]) => void;
declare global { interface Window { dataLayer?: unknown[]; gtag?: Gtag; [k: `ga-disable-${string}`]: boolean | undefined } }

/**
 * Google Analytics 4, loaded ONLY after the visitor accepts analytics cookies. Nothing is requested from Google before that;
 * withdrawing consent switches measurement off and removes the _ga cookies. Inert when NEXT_PUBLIC_GA_ID is not set.
 */
export default function Analytics() {
  const path = usePathname();
  const [on, setOn] = useState(false);

  useEffect(() => {
    if (!GA_ID) return;
    const sync = () => setOn(getConsent()?.analytics === true);
    sync();
    window.addEventListener(CONSENT_CHANGED, sync);
    return () => window.removeEventListener(CONSENT_CHANGED, sync);
  }, []);

  useEffect(() => {
    if (!GA_ID) return;
    const flag = `ga-disable-${GA_ID}` as const;
    if (!on) { window[flag] = true; clearAnalyticsCookies(); return; }
    window[flag] = false;
    if (!window.gtag) {
      window.dataLayer = window.dataLayer || [];
      window.gtag = function gtag(...args: unknown[]) { (window.dataLayer as unknown[]).push(args); } as Gtag;
      window.gtag('js', new Date());
      // page views are sent below (also for client-side navigation), so the automatic one is off; no ad personalisation signals
      window.gtag('config', GA_ID, { send_page_view: false, allow_google_signals: false, allow_ad_personalization_signals: false });
      const s = document.createElement('script');
      s.async = true;
      s.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(GA_ID)}`;
      document.head.appendChild(s);
    }
  }, [on]);

  useEffect(() => {
    if (GA_ID && on && window.gtag) window.gtag('event', 'page_view', { page_path: path, page_location: window.location.href, page_title: document.title });
  }, [on, path]);

  return null;
}
