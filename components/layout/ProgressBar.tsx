'use client';
import { useEffect, useRef } from 'react';

/** Thin accent line at the top of every page: scaleX = document scroll progress (read from the DOM, no section constants). */
export default function ProgressBar() {
  const bar = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const f = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      if (bar.current) bar.current.style.transform = `scaleX(${max > 0 ? Math.min(1, window.scrollY / max) : 0})`;
    };
    f();
    window.addEventListener('scroll', f, { passive: true });
    window.addEventListener('resize', f);
    return () => { window.removeEventListener('scroll', f); window.removeEventListener('resize', f); };
  }, []);
  return <div id="bar" ref={bar} aria-hidden="true" />;
}
