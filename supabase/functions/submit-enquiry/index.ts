// Receives the website enquiry form, stores it in Postgres, then notifies the team on WhatsApp (and optionally email).
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const sb = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!, { auth: { persistSession: false } });
const ORIGINS = (Deno.env.get('ALLOWED_ORIGINS') ?? '*').split(',').map((s) => s.trim()).filter(Boolean);
const WA_TO = (Deno.env.get('WHATSAPP_TO') ?? '919480933776,917892317834').split(',').map((s) => s.replace(/\D/g, '')).filter(Boolean); // e.g. 919480933776,917892317834
const GRAPH = 'https://graph.facebook.com/v21.0';
const MAX_PER_HOUR = 5;

function cors(origin: string) {
  const any = ORIGINS.includes('*');
  return {
    'Access-Control-Allow-Origin': any ? '*' : ORIGINS.includes(origin) ? origin : ORIGINS[0] ?? '',
    'Access-Control-Allow-Headers': 'content-type, authorization, apikey',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    Vary: 'Origin',
  };
}
const reply = (body: unknown, status: number, h: Record<string, string>) =>
  new Response(JSON.stringify(body), { status, headers: { ...h, 'Content-Type': 'application/json' } });

const clip = (v: unknown, n: number) => String(v ?? '').trim().slice(0, n);
async function sha256(s: string) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s));
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');
}
// WhatsApp template parameters can't contain new lines, tabs or 4+ spaces in a row
const wa = (s: string, n: number) => s.replace(/[\r\n\t]+/g, ' | ').replace(/ {4,}/g, '   ').trim().slice(0, n) || '-';

type Row = { id: string; name: string; phone: string; email: string | null; message: string | null };

async function sendWhatsApp(row: Row) {
  const token = Deno.env.get('WHATSAPP_TOKEN'), phoneId = Deno.env.get('WHATSAPP_PHONE_NUMBER_ID');
  if (!token || !phoneId || !WA_TO.length) return { sent: false, error: 'WhatsApp is not configured' };
  const template = Deno.env.get('WHATSAPP_TEMPLATE'); // approved template name; without it a plain text message is sent (only delivered inside WhatsApp's 24h window)
  const when = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
  const results = await Promise.allSettled(WA_TO.map(async (to) => {
    const payload = template
      ? { messaging_product: 'whatsapp', to, type: 'template', template: { name: template, language: { code: Deno.env.get('WHATSAPP_TEMPLATE_LANG') ?? 'en' },
          components: [{ type: 'body', parameters: [
            wa(row.name, 120), wa(row.phone, 40), wa(row.email ?? 'not given', 120), wa(row.message ?? 'not given', 600), when,
          ].map((text) => ({ type: 'text', text })) }] } }
      : { messaging_product: 'whatsapp', to, type: 'text',
          text: { body: `New Configrow enquiry\nName: ${row.name}\nPhone: ${row.phone}\nEmail: ${row.email ?? 'not given'}\nAbout: ${row.message ?? 'not given'}\n${when}` } };
    const r = await fetch(`${GRAPH}/${phoneId}/messages`, { method: 'POST', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    if (!r.ok) throw new Error(`${to}: ${r.status} ${(await r.text()).slice(0, 300)}`);
  }));
  const errors = results.flatMap((r) => (r.status === 'rejected' ? [String(r.reason?.message ?? r.reason)] : []));
  return { sent: results.some((r) => r.status === 'fulfilled'), error: errors.join(' ; ') || null };
}

async function sendEmail(row: Row) { // optional backup copy, via Resend
  const key = Deno.env.get('RESEND_API_KEY'), to = Deno.env.get('NOTIFY_EMAIL');
  if (!key || !to) return;
  await fetch('https://api.resend.com/emails', { method: 'POST', headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from: Deno.env.get('NOTIFY_FROM') ?? 'Configrow <onboarding@resend.dev>', to: [to], subject: `New enquiry from ${row.name}`,
      text: `Name: ${row.name}\nPhone: ${row.phone}\nEmail: ${row.email ?? 'not given'}\n\n${row.message ?? ''}` }) });
}

async function notify(row: Row) {
  const [wa_] = await Promise.allSettled([sendWhatsApp(row), sendEmail(row)]);
  const res = wa_.status === 'fulfilled' ? wa_.value : { sent: false, error: String(wa_.reason) };
  await sb.from('enquiries').update({ whatsapp_sent: res.sent, whatsapp_error: res.error }).eq('id', row.id);
}

Deno.serve(async (req) => {
  const h = cors(req.headers.get('origin') ?? '');
  if (req.method === 'OPTIONS') return new Response('ok', { headers: h });
  if (req.method !== 'POST') return reply({ error: 'Method not allowed' }, 405, h);

  let b: Record<string, unknown>;
  try { b = await req.json(); } catch { return reply({ error: 'Invalid JSON' }, 400, h); }

  if (clip(b.website, 200)) return reply({ ok: true }, 200, h); // honeypot filled in => a bot; pretend success

  const name = clip(b.name, 120), phone = clip(b.phone, 30), email = clip(b.email, 254), message = clip(b.message, 4000);
  const digits = phone.replace(/\D/g, '');
  if (!name) return reply({ error: 'Please enter your name.' }, 422, h);
  if (digits.length < 8 || digits.length > 15) return reply({ error: 'Please enter a valid phone number.' }, 422, h);
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return reply({ error: 'Please enter a valid email.' }, 422, h);

  const ip = (req.headers.get('x-forwarded-for') ?? req.headers.get('x-real-ip') ?? 'unknown').split(',')[0].trim();
  const ipHash = await sha256(`${ip}|${Deno.env.get('IP_SALT') ?? 'configrow'}`);
  const since = new Date(Date.now() - 3600_000).toISOString();
  const { count } = await sb.from('enquiries').select('id', { count: 'exact', head: true }).eq('ip_hash', ipHash).gte('created_at', since);
  if ((count ?? 0) >= MAX_PER_HOUR) return reply({ error: 'Too many requests. Please call us instead.' }, 429, h);

  const { data, error } = await sb.from('enquiries').insert({
    name, phone, email: email || null, message: message || null,
    source_page: clip(b.source_page, 200) || null, ip_hash: ipHash, user_agent: clip(req.headers.get('user-agent'), 300) || null,
  }).select('id, name, phone, email, message').single();
  if (error || !data) { console.error('insert failed', error); return reply({ error: 'Could not save your enquiry.' }, 500, h); }

  const task = notify(data as Row).catch((e) => console.error('notify failed', e));
  // deno-lint-ignore no-explicit-any
  const rt = (globalThis as any).EdgeRuntime;
  if (rt?.waitUntil) rt.waitUntil(task); else await task; // reply immediately, notify in the background
  return reply({ ok: true }, 200, h);
});
