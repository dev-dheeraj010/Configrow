'use client';
import { useEffect, useRef, ButtonHTMLAttributes, CSSProperties } from 'react';
import Link from 'next/link';

type Props = Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'color'> & {
  size?: 'sm' | 'md' | 'lg';
  radius?: number;
  tint?: string;
  tintOpacity?: number;
  textColor?: string;
  lineColor?: string;
  baseColor?: string;
  intensity?: number;      // shine strength when the pointer is on/near the button
  idleIntensity?: number;  // resting shine strength
  shineSize?: number;      // solid core radius of the border highlight (px)
  shineFade?: number;      // falloff distance of the highlight (px)
  thickness?: number;      // border thickness (px)
  glow?: number;           // outer glow multiplier
  followMouse?: boolean;
  proximity?: number;      // how far (px) from the button the pointer starts to brighten it
  href?: string;           // renders a Next.js Link instead of a <button>
};

/** Glass button with a specular border highlight that follows the pointer. Styles live in globals.css (.spec). */
export default function SpecularButton({
  size = 'md', radius = 14, tint = '#ffffff', tintOpacity = 0.04, textColor = '#f5f5f5',
  lineColor = '#0061ff', baseColor = '#0053da', intensity = 1, idleIntensity = 0.35,
  shineSize = 10, shineFade = 34, thickness = 1.2, glow = 1, followMouse = true, proximity = 250,
  className = '', style, children, href, ...rest
}: Props) {
  const ref = useRef<HTMLButtonElement & HTMLAnchorElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || !followMouse) return;
    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      const cx = Math.min(Math.max(e.clientX, r.left), r.right), cy = Math.min(Math.max(e.clientY, r.top), r.bottom);
      const d = Math.hypot(e.clientX - cx, e.clientY - cy);
      const k = d >= proximity ? 0 : 1 - d / proximity;
      el.style.setProperty('--i', String(idleIntensity + (intensity - idleIntensity) * k));
      if (k > 0) { el.style.setProperty('--mx', `${cx - r.left}px`); el.style.setProperty('--my', `${cy - r.top}px`); }
      else { el.style.setProperty('--mx', `${r.width / 2}px`); el.style.setProperty('--my', '0px'); }
    };
    window.addEventListener('pointermove', onMove);
    return () => window.removeEventListener('pointermove', onMove);
  }, [followMouse, proximity, intensity, idleIntensity]);

  const vars = {
    '--i': idleIntensity, '--r': `${radius}px`, '--t': `${thickness}px`, '--line': lineColor, '--base': baseColor,
    '--ss': `${shineSize}px`, '--sf': `${shineFade}px`, '--gl': glow, '--tc': textColor,
    '--tint': `color-mix(in srgb, ${tint} ${tintOpacity * 100}%, transparent)`,
  } as CSSProperties;

  const cls = `spec ${size} ${className}`, st = { ...vars, ...style };
  if (href) return <Link ref={ref} href={href} className={cls} style={st}>{children}</Link>;
  return <button ref={ref} className={cls} style={st} {...rest}>{children}</button>;
}
