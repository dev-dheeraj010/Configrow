'use client';
import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

let lenisRef: Lenis | null = null;
export const lenisControl = {
  stop: () => lenisRef?.stop(),
  start: () => lenisRef?.start(),
  scrollTo: (y: number) => (lenisRef ? lenisRef.scrollTo(y, { duration: 2.5 }) : window.scrollTo({ top: y, behavior: 'smooth' })),
};

export default function SmoothScroll() {
  const pathname = usePathname();

  // Lenis smooth scroll, driven by the GSAP ticker so ScrollTrigger stays in sync
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const lenis = new Lenis({ lerp: 0.08 });
    lenisRef = lenis;
    lenis.on('scroll', ScrollTrigger.update);
    const tick = (t: number) => lenis.raf(t * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);
    return () => { gsap.ticker.remove(tick); lenis.destroy(); lenisRef = null; };
  }, []);

  // fade-up reveal for every .rv element, re-run per page
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>('.rv').forEach((el) =>
        gsap.from(el, { y: 50, opacity: 0, duration: 1, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 94%' } })
      );
    });
    return () => ctx.revert();
  }, [pathname]);

  // in-page anchors (#x or /#x) on the home page scroll smoothly
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const a = (e.target as HTMLElement).closest('a');
      if (!a || window.location.pathname !== '/') return;
      const m = (a.getAttribute('href') || '').match(/^\/?#(.+)$/);
      const el = m ? document.getElementById(m[1]) : null;
      if (!el) return;
      e.preventDefault();
      if (lenisRef) lenisRef.scrollTo(el); else el.scrollIntoView({ behavior: 'smooth' });
    };
    document.addEventListener('click', onClick, true);
    return () => document.removeEventListener('click', onClick, true);
  }, []);

  return null;
}
