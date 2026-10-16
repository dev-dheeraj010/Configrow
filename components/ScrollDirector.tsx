'use client';
import { useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { sceneState as S } from '@/lib/sceneState';

const PI2 = Math.PI * 2;
/** Extra scroll (in vh) the pinned Services section adds on desktop: its height is 250vh, so 150vh more than a normal section. Must match Services.tsx. */
const SERVICES_EXTRA = 1.5;

/**
 * Scroll map (1 timeline unit = 100vh of scroll inside #main; "o" = SERVICES_EXTRA on desktop, 0 on mobile):
 *  0 -> 1        Hero -> Services    | logo drifts to just left of centre, wireframe fills in (Blueprint -> Build)
 *  1 -> 1+o      Services (pinned)   | cards appear one by one (see ServiceCards.tsx)
 *  1+o -> 2+o    Services -> Promise | logo glides to centre, spins, shrinks
 *  2+o -> 4+o    Promise (pinned)    | five promises light up, glow steps 0 -> 1 (Launch)
 *  4+o -> 5+o    Promise -> About    | logo moves right, lead particles stream out (Growth)
 *  5+o -> 6+o    About -> Enquiry    | logo moves left, calm
 */
export default function ScrollDirector() {
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const upd = () => { const wide = window.innerWidth > 800; S.sx = wide ? 2.3 : 0; S.sy = wide ? 0 : 1.9; };
    upd();
    ScrollTrigger.addEventListener('refreshInit', upd);

    const mm = gsap.matchMedia();
    mm.add({ desk: '(min-width: 801px)', mob: '(max-width: 800px)' }, (c) => {
      const o = c.conditions?.desk ? SERVICES_EXTRA : 0;
      upd();
      Object.assign(S, { px: S.sx * 1.35, py: S.sy, s: c.conditions?.desk ? 0.85 : 1, rx: 0.1, ry: -0.45, solid: 0, glow: 0, lead: 0, grid: 1, ring: 1, camY: 1.2, camZ: 7.5, r2s: 1.3 });
      const tl = gsap.timeline({ defaults: { ease: 'none' }, scrollTrigger: { trigger: '#main', start: 'top top', end: 'bottom bottom', scrub: 1, invalidateOnRefresh: true } });
      tl.to(S, { px: () => -S.sx * 0.12, duration: 1 }, 0).to(S, { px: 0, py: () => S.sy, duration: 1 }, 1 + o).to(S, { px: () => S.sx, duration: 1 }, 4 + o).to(S, { px: () => -S.sx * 1.35, duration: 1 }, 5 + o);
      tl.to(S, { ry: 0.35, duration: 1 }, 0).to(S, { ry: PI2, duration: 1 }, 1 + o).to(S, { ry: PI2 + 0.35, duration: 1 }, 4 + o).to(S, { ry: PI2 - 0.25, duration: 1 }, 5 + o);
      tl.to(S, { solid: 1, grid: 0, duration: 1 }, 0).to(S, { lead: 1, duration: 1 }, 4 + o).to(S, { lead: 0.35, duration: 1 }, 5 + o);
      for (let k = 1; k <= 5; k++) tl.to(S, { glow: k * 0.2, duration: 0.3 }, 2 + o + 2 * (0.1 + (k - 1) * 0.17)); // keep in sync with Promise.tsx thresholds
      tl.to(S, { camY: 0, duration: 1 }, 0).to(S, { camZ: 9.5, duration: 1 }, 1 + o).to(S, { camZ: 6.5, duration: 2 }, 4 + o);
      tl.to(S, { s: 1, duration: 1 }, 0).to(S, { s: 0.55, duration: 1 }, 1 + o).to(S, { s: 1, duration: 1 }, 4 + o);
      tl.to(S, { r2s: 2.1, duration: 2 }, 2 + o);
      tl.to(S, { ring: 0, duration: 0.3 }, 1.8 + o).to(S, { ring: 1, duration: 0.5 }, 3.9 + o);
    });

    return () => { ScrollTrigger.removeEventListener('refreshInit', upd); mm.revert(); };
  }, []);

  return (<div className="glow" />);
}
