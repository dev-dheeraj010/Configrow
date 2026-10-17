// Receives the website enquiry form, stores it in Postgres, then notifies the team on WhatsApp (and optionally email).
//
// Abuse protection, in the order a request meets it:
//   method / origin / content-type / body size  ->  honeypot  ->  Turnstile (if configured)  ->  validation
//   ->  duplicate check  ->  per-visitor rate limit  ->  insert  ->  WhatsApp (skipped, not failed, when the hourly cap is hit)
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const sb = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!, { auth: { persistSession: false } });
const ORIGINS = (Deno.env.get('ALLOWED_ORIGINS') ?? 'https://www.configrow.in,https://configrow.in').split(',').map((s) => s.trim()).filter(Boolean);
const WA_TO = (Deno.env.get('WHATSAPP_TO') ?? '919480933776,917892317834').split(',').map((s) => s.replace(/\D/g, '')).filter(Boolean);
const GRAPH = 'https://graph.facebook.com/v21.0';
const TURNSTILE_SECRET = Deno.env.get('TURNSTILE_SECRET_KEY'); // when set, every submission must carry a valid Turnstile token

const MAX_PER_HOUR_PER_VISITOR = 5;   // stored enquiries per hashed IP per hour
const MAX_WHATSAPPS_PER_HOUR = 40;    // all visitors together: beyond this we still SAVE the enquiry but stop paying for messages
const DUPLICATE_WINDOW_MS = 10 * 60_000;
const MAX_BODY_BYTES = 16 * 1024;

function cors(origin: string) {
  return {
    'Access-Control-Allow-Origin': ORIGINS.includes(origin) ? origin : ORIGINS[0] ?? '',
    'Access-Control-Allow-Headers': 'content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Max-Age': '86400',
    Vary: 'Origin',
  };
}
const reply = (body: unknown, status: number, h: Record<string, string>) =>
  new Response(JSON.stringify(body), { status, headers: { ...h, 'Content-Type': 'application/json', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' } });

/** Trim, drop control characters (keeping tab/newline only where allowed), cap length. */
const clean = (v: unknown, n: number, multiline = false) =>
  String(typeof v === 'string' || typeof v === 'number' ? v : '')
    .replace(multiline ? /[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g : /[\u0000-\u001f\u007f]/g, '')
    .trim()
    .slice(0, n);

async function sha256(s: string) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s));
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');
}
// WhatsApp template parameters can't contain new lines, tabs or 4+ spaces in a row
const wa = (s: string, n: number) => s.replace(/[\r\n\t]+/g, ' | ').replace(/ {4,}/g, '   ').trim().slice(0, n) || '-';

/** Reads the body but gives up once it exceeds `max` bytes (Content-Length can be missing or a lie). */
async function readLimited(req: Request, max: number): Promise<string | null> {
  const declared = Number(req.headers.get('content-length') ?? '0');
  if (declared > max) return null;
  const reader = req.body?.getReader();
  if (!reader) return '';
  const chunks: Uint8Array[] = [];
  let total = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    total += value.byteLength;
    if (total > max) { await reader.cancel(); return null; }
    chunks.push(value);
  }
  const all = new Uint8Array(total);
  let o = 0;
  for (const c of chunks) { all.set(c, o); o += c.byteLength; }
  return new TextDecoder().decode(all);
}

/** Visitor IP as seen by Cloudflare (which fronts Supabase). A client can forge the start of X-Forwarded-For, never cf-connecting-ip. */
function clientIp(req: Request) {
  const cf = req.headers.get('cf-connecting-ip') ?? req.headers.get('x-real-ip');
  if (cf) return cf.trim();
  const xff = (req.headers.get('x-forwarded-for') ?? '').split(',').map((s) => s.trim()).filter(Boolean);
  return xff[xff.length - 1] ?? 'unknown';
}

async function turnstileOk(token: string, ip: string) {
  if (!TURNSTILE_SECRET) return true; // not configured yet: the other defences still apply
  if (!token || token.length > 2048) return false;
  try {
    const r = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ secret: TURNSTILE_SECRET, response: token, remoteip: ip }),
    });
    const j = await r.json();
    return j?.success === true;
  } catch { return false; }
}

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
  return { sent: results.every((r) => r.status === 'fulfilled'), error: errors.join(' ; ') || null };
}

/** Plain-text alert to every address in NOTIFY_EMAIL (comma separated), through Resend's HTTPS API. Free tier: 3,000/month. */
async function sendEmail(row: Row) {
  const key = Deno.env.get('RESEND_API_KEY');
  const to = (Deno.env.get('NOTIFY_EMAIL') ?? '').split(',').map((s) => s.trim()).filter((s) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s));
  if (!key || !to.length) return { sent: false, error: 'Email is not configured' };
  const when = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
  const r = await fetch('https://api.resend.com/emails', {
    method: 'POST', headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: Deno.env.get('NOTIFY_FROM') ?? 'Configrow <onboarding@resend.dev>',
      to,
      ...(row.email ? { reply_to: row.email } : {}), // hitting Reply answers the enquirer
      subject: `New Configrow enquiry from ${row.name}`.slice(0, 150),
      text: `New Configrow enquiry\n\nName: ${row.name}\nPhone: ${row.phone}\nEmail: ${row.email ?? 'not given'}\nReceived: ${when}\n\nAbout their business:\n${row.message ?? 'not given'}\n`,
    }),
  });
  if (!r.ok) return { sent: false, error: `${r.status} ${(await r.text()).slice(0, 300)}` };
  return { sent: true, error: null };
}

async function notify(row: Row) {
  // cost guard: count alerts already attempted in the last hour (an *_error / *_sent value is set once an attempt finished)
  const since = new Date(Date.now() - 3600_000).toISOString();
  const { count } = await sb.from('enquiries').select('id', { count: 'exact', head: true }).gte('created_at', since)
    .or('whatsapp_sent.eq.true,whatsapp_error.not.is.null,email_sent.eq.true,email_error.not.is.null');
  if ((count ?? 0) >= MAX_WHATSAPPS_PER_HOUR) {
    const why = 'skipped: hourly alert cap reached (enquiry saved)';
    await sb.from('enquiries').update({ whatsapp_sent: false, whatsapp_error: why, email_sent: false, email_error: why }).eq('id', row.id);
    return;
  }
  // each channel is independent: one failing never blocks the other, and the enquiry is already saved
  const [w, e] = await Promise.allSettled([sendWhatsApp(row), sendEmail(row)]);
  const wa_ = w.status === 'fulfilled' ? w.value : { sent: false, error: String(w.reason).slice(0, 300) };
  const em = e.status === 'fulfilled' ? e.value : { sent: false, error: String(e.reason).slice(0, 300) };
  await sb.from('enquiries').update({ whatsapp_sent: wa_.sent, whatsapp_error: wa_.error, email_sent: em.sent, email_error: em.error }).eq('id', row.id);
}

Deno.serve(async (req) => {
  const origin = req.headers.get('origin') ?? '';
  const h = cors(origin);
  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: h });
  if (req.method !== 'POST') return reply({ error: 'Method not allowed' }, 405, h);
  if (origin && !ORIGINS.includes(origin)) return reply({ error: 'Forbidden' }, 403, h);
  if (!(req.headers.get('content-type') ?? '').toLowerCase().startsWith('application/json')) return reply({ error: 'Unsupported content type' }, 415, h);

  const raw = await readLimited(req, MAX_BODY_BYTES);
  if (raw === null) return reply({ error: 'Request too large' }, 413, h);
  let b: Record<string, unknown>;
  try { const j = JSON.parse(raw); if (!j || typeof j !== 'object' || Array.isArray(j)) throw new Error('shape'); b = j; } catch { return reply({ error: 'Invalid request' }, 400, h); }

  if (clean(b.website, 200)) return reply({ ok: true }, 200, h); // honeypot filled in => a bot; pretend success

  const ip = clientIp(req);
  if (!(await turnstileOk(clean(b.turnstile, 2048), ip))) return reply({ error: 'Verification failed. Please try again, or call us.' }, 403, h);

  const name = clean(b.name, 120), phone = clean(b.phone, 30), email = clean(b.email, 254), message = clean(b.message, 4000, true);
  const digits = phone.replace(/\D/g, '');
  if (!name) return reply({ error: 'Please enter your name.' }, 422, h);
  if (!/^[0-9+()\-.\s]+$/.test(phone) || digits.length < 8 || digits.length > 15) return reply({ error: 'Please enter a valid phone number.' }, 422, h);
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return reply({ error: 'Please enter a valid email.' }, 422, h);
  const page = clean(b.source_page, 200);
  const sourcePage = /^\/[A-Za-z0-9/_\-.]*$/.test(page) ? page : null;

  const ipHash = await sha256(`${ip}|${Deno.env.get('IP_SALT') ?? 'configrow'}`);

  // identical enquiry (same phone + same text) within 10 minutes: acknowledge, don't store or message again
  const dupSince = new Date(Date.now() - DUPLICATE_WINDOW_MS).toISOString();
  let dup = sb.from('enquiries').select('id', { count: 'exact', head: true }).eq('phone', phone).gte('created_at', dupSince);
  dup = message ? dup.eq('message', message) : dup.is('message', null);
  const { count: dupCount } = await dup;
  if ((dupCount ?? 0) > 0) return reply({ ok: true }, 200, h);

  const since = new Date(Date.now() - 3600_000).toISOString();
  const { count } = await sb.from('enquiries').select('id', { count: 'exact', head: true }).eq('ip_hash', ipHash).gte('created_at', since);
  if ((count ?? 0) >= MAX_PER_HOUR_PER_VISITOR) return reply({ error: 'Too many requests. Please call us instead.' }, 429, h);

  const { data, error } = await sb.from('enquiries').insert({
    name, phone, email: email || null, message: message || null,
    source_page: sourcePage, ip_hash: ipHash, user_agent: clean(req.headers.get('user-agent'), 300) || null,
  }).select('id, name, phone, email, message').single();
  if (error || !data) { console.error('insert failed', error?.code); return reply({ error: 'Could not save your enquiry.' }, 500, h); }

  const task = notify(data as Row).catch((e) => console.error('notify failed', String(e?.message ?? e).slice(0, 200)));
  // deno-lint-ignore no-explicit-any
  const rt = (globalThis as any).EdgeRuntime;
  if (rt?.waitUntil) rt.waitUntil(task); else await task; // reply immediately, notify in the background
  return reply({ ok: true }, 200, h);
});
