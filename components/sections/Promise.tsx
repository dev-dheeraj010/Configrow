'use client';
import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { PROMISE_PAYOFF, PROMISE_STEPS, tileHalfPx } from '@/lib/scene';
import { RANGE } from '@/lib/scroll';

const ITEMS = ['Exquisite design language', 'Optimized for peak performance', 'Google-optimized websites', 'Cross-platform designs', 'Continuous care, zero compromise'];
const ANG = [-90, -18, 54, 126, 198]; // pentagon around the centre logo
type Geo = { x: number; y: number; lf: boolean; d: string };

/** Pinned "Configrow Way" chapter: nodes light up one by one, pulses flow out from the logo tile. */
export default function PromiseSection() {
  const stick = useRef<HTMLDivElement>(null);
  const [geo, setGeo] = useState<Geo[] | null>(null);
  const [vb, setVb] = useState('0 0 100 100');
  const [count, setCount] = useState(0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const el = stick.current!;
    const layout = () => {
      const r = el.getBoundingClientRect(), W = r.width, H = r.height, cx = W / 2, cy = H / 2;
      setVb(`0 0 ${W} ${H}`);
      if (window.innerWidth <= 800) { setGeo(null); return; }
      const Rx = Math.min(W * 0.28, 430), Ry = Math.min(H * 0.25, 250), hs = tileHalfPx(H); // half the logo tile's size on screen, from the camera + scale the scene uses
      setGeo(ANG.map((deg, i) => {
        const t = (deg * Math.PI) / 180, x = cx + Rx * Math.cos(t), y = cy + Ry * Math.sin(t);
        const dx = x - cx, dy = y - cy, L = Math.hypot(dx, dy), ux = dx / L, uy = dy / L;
        const kk = (hs / Math.max(Math.abs(ux), Math.abs(uy))) * 0.95;      // start exactly at the logo tile edge
        const a0 = cx + ux * kk, b0 = cy + uy * kk, ex = x - ux * 40, ey = y - uy * 40;
        const sg = i % 2 ? 1 : -1, qx = (a0 + ex) / 2 - uy * L * 0.1 * sg, qy = (b0 + ey) / 2 + ux * L * 0.1 * sg;
        return { x, y, lf: x < cx - 5, d: `M${a0} ${b0}Q${qx} ${qy} ${ex} ${ey}` };
      }));
    };
    layout();
    const ro = new ResizeObserver(layout); ro.observe(el);

    let last = 0, lastDone = false;
    const st = ScrollTrigger.create({
      trigger: '#promise', start: RANGE.pin.start, end: RANGE.pin.end,
      onUpdate: (t) => {
        const p = t.progress; let c = 0;
        PROMISE_STEPS.forEach((th, i) => { if (p >= th) c = i + 1; }); // same thresholds the scene's glow uses (lib/scene.ts)
        if (c !== last) { last = c; setCount(c); }
        const d = p >= PROMISE_PAYOFF; if (d !== lastDone) { lastDone = d; setDone(d); }
      },
    });
    return () => { ro.disconnect(); st.kill(); };
  }, []);

  return (
    <section className="s" id="promise" style={{ display: 'block', padding: 0, minHeight: '300vh' }}>
      <div className="stick" ref={stick}>
        <div className="k">03 — THE CONFIGROW WAY</div>
        <h2>What makes us Configrow<b>.</b></h2>
        <p>Five promises. One standard.</p>
        <svg className="pls" viewBox={vb} aria-hidden="true">
          {geo && geo.map((g, i) => (
            <g key={i}>
              <path className={'bl' + (i < count ? ' on' : '')} d={g.d} />
              <path className={'pu' + (i < count ? ' on' : '')} d={g.d} pathLength={100} style={{ animationDelay: `${i * 0.26}s` }} />
            </g>
          ))}
        </svg>
        {ITEMS.map((t, i) => (
          <div key={i} data-i={i + 1} className={'pm' + (i < count ? ' on' : '') + (geo && geo[i].lf ? ' lf' : '')}
               style={geo ? { left: geo[i].x - 32, top: geo[i].y - 32 } : undefined}>
            <b className="nd"><u /></b>
            <span><i>0{i + 1}</i>{t}</span>
          </div>
        ))}
        <div id="std" className={done ? 'on' : ''}>The Configrow standard<b>.</b></div>
      </div>
    </section>
  );
}
