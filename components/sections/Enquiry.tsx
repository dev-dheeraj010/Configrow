'use client';
import Link from 'next/link';
import { FormEvent, useState } from 'react';
import SpecularButton from '../SpecularButton';

const ENDPOINT = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/submit-enquiry`;

/** Enquiry form: posts to the Supabase Edge Function (saves the enquiry, then WhatsApps the team). */
export default function Enquiry() {
  const [state, setState] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget, f = new FormData(form);
    setState('sending');
    try {
      const r = await fetch(ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '' },
        body: JSON.stringify({
          name: f.get('name'), phone: f.get('phone'), email: f.get('email'), message: f.get('about'),
          website: f.get('website'),                 // honeypot: real visitors leave it empty
          source_page: window.location.pathname,
        }),
      });
      if (!r.ok) throw new Error(String(r.status));
      setState('sent');
      form.reset();
    } catch {
      setState('error');
    }
  };

  return (
    <section className="s r" id="enquiry">
      <div className="c">
        <div className="k rv">05 — NEXT STEP</div>
        <h2 className="rv">Let&apos;s build something extraordinary<b>.</b></h2>
        <form className="rv" onSubmit={onSubmit}>
          <label htmlFor="n">NAME</label><input id="n" name="name" required maxLength={120} />
          <label htmlFor="p">PHONE / WHATSAPP</label><input id="p" name="phone" type="tel" required minLength={8} maxLength={30} />
          <label htmlFor="e">EMAIL (OPTIONAL)</label><input id="e" name="email" type="email" maxLength={254} />
          <label htmlFor="m">ABOUT YOUR BUSINESS</label><textarea id="m" name="about" rows={2} maxLength={4000} />
          <input name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" style={{ position: 'absolute', left: '-9999px' }} />
          <SpecularButton type="submit" size="lg" radius={18} tint="#ffffff" tintOpacity={0.04} textColor="#f5f5f5"
            lineColor="#0061ff" baseColor="#0053da" intensity={1} idleIntensity={0.35} shineSize={10} shineFade={34}
            thickness={1.2} glow={1} followMouse proximity={250} disabled={state === 'sending'} style={{ marginTop: 40 }}>
            {state === 'sending' ? 'Sending…' : 'Send enquiry'} <span>→</span>
          </SpecularButton>
          <p role="status" style={{ fontSize: 14, minHeight: 24 }}>
            {state === 'sent' && "Thanks! We've got your enquiry and will call or WhatsApp you shortly."}
            {state === 'error' && (<>We couldn&apos;t send that. Please call <a className="ul" href="tel:+919480933776">+91 94809 33776</a> or email <a className="ul" href="mailto:info@configrow.in">info@configrow.in</a>.</>)}
          </p>
        </form>
        <p className="rv" style={{ fontSize: 14 }}>Not sure which plan fits? <Link className="ul" href="/pricing">See our pricing →</Link></p>
      </div>
    </section>
  );
}
