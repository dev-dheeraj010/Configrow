'use client';
import Link from 'next/link';
import { FormEvent, useCallback, useEffect, useRef, useState } from 'react';
import SpecularButton from '../layout/SpecularButton';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const ENDPOINT = SUPABASE_URL ? `${SUPABASE_URL}/functions/v1/submit-enquiry` : '';
const TURNSTILE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

type TurnstileApi = {
  render: (el: HTMLElement, o: { sitekey: string; theme?: 'auto' | 'light' | 'dark'; callback: (t: string) => void; 'expired-callback': () => void; 'error-callback': () => void }) => string;
  reset: (id?: string) => void;
  remove: (id?: string) => void;
};
declare global { interface Window { turnstile?: TurnstileApi } }

/** Loads Cloudflare Turnstile once (only on this form) and renders the widget into `host`. Returns the current token (or '' while unsolved). */
function useTurnstile(host: React.RefObject<HTMLDivElement | null>) {
  const [token, setToken] = useState('');
  const id = useRef<string>('');
  useEffect(() => {
    if (!TURNSTILE_KEY || !host.current) return;
    let dead = false;
    const draw = () => {
      if (dead || !window.turnstile || !host.current || id.current) return;
      id.current = window.turnstile.render(host.current, { sitekey: TURNSTILE_KEY, theme: 'auto', callback: setToken, 'expired-callback': () => setToken(''), 'error-callback': () => setToken('') });
    };
    if (window.turnstile) draw();
    else {
      const s = document.createElement('script');
      s.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
      s.async = true; s.defer = true; s.onload = draw;
      document.head.appendChild(s);
    }
    return () => { dead = true; if (id.current && window.turnstile) window.turnstile.remove(id.current); id.current = ''; };
  }, [host]);
  const reset = useCallback(() => { setToken(''); if (id.current && window.turnstile) window.turnstile.reset(id.current); }, []);
  return { token, reset };
}

/** Enquiry form: posts to the Supabase Edge Function (saves the enquiry, then WhatsApps the team). */
export default function Enquiry() {
  const [state, setState] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const widget = useRef<HTMLDivElement>(null);
  const ts = useTurnstile(widget);
  const needsCheck = !!TURNSTILE_KEY;

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (needsCheck && !ts.token) return;
    const form = e.currentTarget, f = new FormData(form);
    setState('sending');
    try {
      if (!ENDPOINT) throw new Error('NEXT_PUBLIC_SUPABASE_URL is not set');
      const r = await fetch(ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: f.get('name'), phone: f.get('phone'), email: f.get('email'), message: f.get('about'),
          website: f.get('website'),                 // honeypot: real visitors leave it empty
          turnstile: ts.token,
          source_page: window.location.pathname,
        }),
      });
      if (!r.ok) throw new Error(String(r.status));
      setState('sent');
      form.reset();
    } catch {
      setState('error');
    } finally {
      ts.reset(); // a Turnstile token is single-use
    }
  };

  return (
    <section className="s r" id="enquiry">
      <div className="c">
        <div className="k rv">05 — NEXT STEP</div>
        <h2 className="rv">Let&apos;s build something extraordinary<b>.</b></h2>
        <form className="rv" onSubmit={onSubmit}>
          <label htmlFor="n">NAME</label><input id="n" name="name" required maxLength={120} autoComplete="name" />
          <label htmlFor="p">PHONE / WHATSAPP</label><input id="p" name="phone" type="tel" required minLength={8} maxLength={30} autoComplete="tel" inputMode="tel" />
          <label htmlFor="e">EMAIL (OPTIONAL)</label><input id="e" name="email" type="email" maxLength={254} autoComplete="email" />
          <label htmlFor="m">ABOUT YOUR BUSINESS</label><textarea id="m" name="about" rows={2} maxLength={4000} />
          <input name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" style={{ position: 'absolute', left: '-9999px' }} />
          {needsCheck && <div ref={widget} className="ts" role="group" aria-label="Security check" />}
          <SpecularButton type="submit" size="lg" radius={18} tint="#ffffff" tintOpacity={0.04} textColor="#f5f5f5"
            lineColor="#0061ff" baseColor="#0053da" intensity={1} idleIntensity={0.35} shineSize={10} shineFade={34}
            thickness={1.2} glow={1} followMouse proximity={250} disabled={state === 'sending' || (needsCheck && !ts.token)} style={{ marginTop: 28 }}>
            {state === 'sending' ? 'Sending…' : 'Send enquiry'} <span>→</span>
          </SpecularButton>
          <p role="status" aria-live="polite" style={{ fontSize: 14, minHeight: 24 }}>
            {state === 'sent' && "Thanks! We've got your enquiry and will call or WhatsApp you shortly."}
            {state === 'error' && (<>We couldn&apos;t send that. Please call <a className="ul" href="tel:+919480933776">+91 94809 33776</a> or email <a className="ul" href="mailto:info@configrow.in">info@configrow.in</a>.</>)}
          </p>
        </form>
        <p className="rv" style={{ fontSize: 14 }}>Not sure which plan fits? <Link className="ul" href="/pricing">See our pricing →</Link></p>
      </div>
    </section>
  );
}
