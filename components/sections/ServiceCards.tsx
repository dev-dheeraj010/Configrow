'use client';
import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

const TH = [0.08, 0.38, 0.68]; // pin progress at which card 1 / 2 / 3 appears

/** Stacked 3D glass cards (original 420px size). Desktop: each card appears at its own scroll step. Mobile: each appears as it scrolls into view. */
export default function ServiceCards({ cards }: { cards: string[][] }) {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const mob = () => window.innerWidth <= 800;
    const ctx = gsap.context(() => {
      const els = gsap.utils.toArray<HTMLElement>('.sc');
      const tws = els.map((c) => gsap.fromTo(c, { opacity: 0, x: 90, y: 70, scale: 0.94 }, { opacity: 1, x: 0, y: 0, scale: 1, duration: 0.9, ease: 'power3.out', paused: true }));
      const on = [0, 0, 0];
      ScrollTrigger.create({
        trigger: '#services', start: 'top top', end: 'bottom bottom',
        onUpdate: (t) => {
          if (mob()) return;
          TH.forEach((th, i) => { const v = t.progress >= th ? 1 : 0; if (v !== on[i]) { on[i] = v; if (v) tws[i].play(); else tws[i].reverse(); } });
        },
      });
      els.forEach((c, i) => ScrollTrigger.create({
        trigger: c, start: 'top 90%',
        onEnter: () => { if (mob()) tws[i].play(); },
        onLeaveBack: () => { if (mob()) tws[i].reverse(); },
      }));
    }, root);
    return () => ctx.revert();
  }, []);

  return (
    <div className="sw" ref={root}>
      <div className="sk">
        {cards.map(([n, t, d]) => (
          <div className={`sc sc${n[1]}`} key={n}><span>SERVICE {n}</span><h3>{t}</h3><p>{d}</p></div>
        ))}
      </div>
    </div>
  );
}
