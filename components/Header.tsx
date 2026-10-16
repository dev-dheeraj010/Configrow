'use client';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import SpecularButton from './SpecularButton';
import { lenisControl } from './SmoothScroll';

const NAV = [
  { label: 'SERVICES', href: '/#services', id: 'services', n: '02' },
  { label: 'PROMISE', href: '/#promise', id: 'promise', n: '03' },
  { label: 'ABOUT', href: '/#about', id: 'about', n: '04' },
  { label: 'PRICING', href: '/pricing', id: 'pricing', n: '—' },
  { label: 'FAQ', href: '/faq', id: 'faq', n: '—' },
  { label: 'ENQUIRY', href: '/#enquiry', id: 'enquiry', n: '05' },
];

/** Plain nav link (hover = brighter, active = brighter + dot). */
function Pill({ label, href, active }: { label: string; href: string; active: boolean }) {
  return <Link href={href} className={'pn' + (active ? ' act' : '')}>{label}</Link>;
}

export default function Header() {
  const pathname = usePathname();
  const [top, setTop] = useState(true);
  const [hidden, setHidden] = useState(false);
  const [active, setActive] = useState('');
  const [menu, setMenu] = useState(false);
  const last = useRef(0);

  // scroll behaviour: lighter bar at the top, hides while scrolling down through the pinned Promise chapter
  useEffect(() => {
    const f = () => {
      const y = window.scrollY;
      setTop(y < 24);
      const pr = document.getElementById('promise');
      if (pathname === '/' && pr) {
        const r = pr.getBoundingClientRect();
        const inP = r.top <= 10 && r.bottom >= window.innerHeight * 0.5, down = y > last.current + 2, up = y < last.current - 2;
        if (inP && down) setHidden(true); else if (up || !inP) setHidden(false);
        let cur = '';
        ['services', 'promise', 'about', 'enquiry'].forEach((id) => { const e = document.getElementById(id); if (e && e.getBoundingClientRect().top <= window.innerHeight * 0.5) cur = id; });
        setActive(cur);
      } else { setHidden(false); setActive(pathname === '/pricing' ? 'pricing' : pathname === '/faq' ? 'faq' : ''); }
      last.current = y;
    };
    f();
    window.addEventListener('scroll', f, { passive: true });
    return () => window.removeEventListener('scroll', f);
  }, [pathname]);

  // mobile menu: lock scroll, close on Escape / route change
  useEffect(() => {
    document.body.style.overflow = menu ? 'hidden' : '';
    if (menu) lenisControl.stop(); else lenisControl.start();
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setMenu(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [menu]);
  useEffect(() => { setMenu(false); }, [pathname]);

  return (
    <>
      <header className={`${top ? 'top ' : ''}${hidden ? 'hide' : ''}`}>
        <Link href="/#hero" aria-label="Configrow home">
          <Image src="/cg-mark.png" alt="Configrow" width={46} height={26} priority className="lg" />
        </Link>
        <div className="hr">
          <nav>{NAV.map((n) => <Pill key={n.id} label={n.label} href={n.href} active={active === n.id} />)}</nav>
          <SpecularButton href="/#enquiry" size="sm" radius={12}>Start a project <span>→</span></SpecularButton>
          <button className="mb" type="button" aria-label="Open menu" aria-expanded={menu} onClick={() => setMenu(true)}><span /><span /></button>
        </div>
      </header>
      {/* while the bar is hidden the call to action stays reachable */}
      <SpecularButton href="/#enquiry" size="sm" radius={12} className={'cta2' + (hidden ? ' show' : '')}>Start a project <span>→</span></SpecularButton>
      <div id="mnav" className={menu ? 'on' : ''}>
        <button className="mc" type="button" onClick={() => setMenu(false)}>CLOSE</button>
        {NAV.map((n) => <Link key={n.id} className="ml" href={n.href} onClick={() => setMenu(false)}><i>{n.n}</i>{n.label}</Link>)}
      </div>
    </>
  );
}
