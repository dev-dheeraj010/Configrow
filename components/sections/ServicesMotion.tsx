'use client';
import { useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SERVICES_CARDS, SERVICES_HEAD } from '@/lib/scene';
import { RANGE, prefersReducedMotion, scrubbed } from '@/lib/scroll';

/**
 * Services chapter. ONE scrubbed timeline over the section's pinned range (#services, top top -> bottom bottom),
 * smoothing 0.6. Timeline time 0-1 IS pin progress, so scrolling back reverses exactly.
 *
 * Pin progress map (constants in lib/scene.ts):
 *   0.00 - 0.06  heading, label and intro fade in
 *   0.06 - 0.30  card 1 enters   {opacity 0, x 90, y 70, scale .94} -> rest, power3.out
 *   0.34 - 0.58  card 2 enters
 *   0.62 - 0.86  card 3 enters
 *   0.86 - 1.00  hold
 * The logo's drift into this chapter runs on a different trigger over the same element, `#services` enter
 * (top bottom -> top top, see ScrollDirector), which ends exactly where this one begins, before card 1 starts.
 * Phones (<= 800px): the section is not pinned; each card reveals as it scrolls into view.
 */
export default function ServicesMotion() {
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    if (prefersReducedMotion()) return;
    const mm = gsap.matchMedia();
    const intro = '#services .sv-intro > *', cards = gsap.utils.toArray<HTMLElement>('#services .sc');
    const hidden = { opacity: 0, x: 90, y: 70, scale: 0.94 };

    mm.add('(min-width: 801px)', () => {
      // hide first, explicitly (does not depend on how a GSAP version renders fromTo start values inside a scrubbed timeline)
      gsap.set(intro, { opacity: 0, y: 24 });
      gsap.set(cards, hidden);
      const tl = scrubbed('#services', RANGE.pin, 0.6);
      const [h0, h1] = SERVICES_HEAD;
      tl.fromTo(intro, { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: h1 - h0, stagger: 0, ease: 'power2.out', immediateRender: false }, h0);
      cards.forEach((card, i) => {
        const [a, b] = SERVICES_CARDS[i];
        tl.fromTo(card, hidden, { opacity: 1, x: 0, y: 0, scale: 1, duration: b - a, ease: 'power3.out', immediateRender: false }, a);
      });
      tl.set({}, {}, 1); // pad the timeline to exactly 1 so time == pin progress
    });

    mm.add('(max-width: 800px)', () => {
      cards.forEach((card) =>
        gsap.fromTo(card, hidden, { opacity: 1, x: 0, y: 0, scale: 1, duration: 0.9, ease: 'power3.out', immediateRender: true,
          scrollTrigger: { trigger: card, start: 'top 90%', toggleActions: 'play none none reverse' } }));
    });
    return () => mm.revert();
  }, []);
  return null;
}
