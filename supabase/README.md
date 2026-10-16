# Configrow backend: Supabase + WhatsApp alerts

What this does
1. The website form posts to a Supabase **Edge Function** (`submit-enquiry`).
2. It validates the data, blocks bots (hidden honeypot field + max 5 enquiries per hour per visitor) and saves a row in the `enquiries` table.
3. It then sends a WhatsApp message to **+91 94809 33776** and **+91 78923 17834** (and an optional email copy to info@configrow.in).
4. If WhatsApp ever fails, the enquiry is still saved, and the error is stored in `whatsapp_error`, so nothing is lost.

```
migrations/…create_enquiries.sql   the table + security rules
functions/submit-enquiry/index.ts  the endpoint
config-snippet.toml                 turns the login check off for this one public endpoint
(the website form, components/sections/Enquiry.tsx, is already wired to this)
.env.example                                 every secret the function uses
```

> Not tested: this was written without access to your Supabase or Meta accounts, so please run the test in step 8.

## Setup

1. **Create the project** at supabase.com (free tier is fine). Note the *Project URL*, *anon key* and *project ref*.
2. **CLI:** `npm i -g supabase`, then in your project folder `supabase init` (skip if it exists), `supabase login`, `supabase link --project-ref YOUR_REF`.
3. Run `supabase init` in the **project root** (the `supabase/` folder already exists, so keep the files), then add the block from `config-snippet.toml` to `supabase/config.toml`.
4. **Create the table:** `supabase db push`.
5. **WhatsApp Cloud API (Meta):**
   - Create a Meta developer app (type *Business*) and add the **WhatsApp** product.
   - You need a **sender number** registered with the Cloud API. A number that is already on the normal WhatsApp app must be removed or migrated first, so the simplest route is a fresh SIM or virtual number as the sender. Your two numbers then only *receive* alerts.
   - Copy the **Phone number ID**, and create a **permanent token** (Business settings → System users → generate token with `whatsapp_business_messaging`).
   - Create a message template named **`new_enquiry`**, category **Utility**, language **English**, with this body:
     `New Configrow enquiry from {{1}}. Phone: {{2}}. Email: {{3}}. About their business: {{4}}. Received: {{5}}`
     Business-started messages must use an approved template, which usually takes minutes to a day.
   - While testing, add both recipient numbers under *API Setup → To* and verify them.
6. **Set the secrets:**
   `supabase secrets set WHATSAPP_TOKEN=… WHATSAPP_PHONE_NUMBER_ID=… WHATSAPP_TO=919480933776,917892317834 WHATSAPP_TEMPLATE=new_enquiry ALLOWED_ORIGINS=https://www.configrow.in,https://configrow.in,http://localhost:3000 IP_SALT=$(openssl rand -hex 16)`
   (optional email backup: `RESEND_API_KEY`, `NOTIFY_EMAIL`, `NOTIFY_FROM`)
7. **Deploy:** `supabase functions deploy submit-enquiry --no-verify-jwt`
8. **Test:**
   ```
   curl -X POST https://YOUR_REF.supabase.co/functions/v1/submit-enquiry \
     -H "Content-Type: application/json" \
     -d '{"name":"Test","phone":"9876543210","message":"hello"}'
   ```
   Expect `{"ok":true}`, a new row in Table Editor → `enquiries`, and a WhatsApp on both numbers. If `whatsapp_sent` is false, read `whatsapp_error` in that row.
9. **Website:** create `.env.local` from `.env.local.example` (project root) and add the same two variables in your hosting dashboard (Vercel → Settings → Environment Variables).

## Day to day
- Read and manage enquiries in **Supabase → Table Editor → enquiries**. Change `status` (new, contacted, won, lost, spam) and write follow-up notes in `notes`.
- Costs: Supabase free tier covers this volume. Meta charges a small fee per business-started template message in India, and each enquiry sends two.
- Access tokens can expire if you use a temporary one. Use a permanent system-user token.

## Things to know
- A plain `wa.me` link can't forward anything automatically. Without the Cloud API or a provider (Twilio, Interakt, Wati, Gupshup…), a person has to press send. To switch provider, only `sendWhatsApp()` in `index.ts` changes.
- The form now asks for a **phone number** (required) and makes email optional, so you can call or WhatsApp straight back. Change this in `Enquiry.tsx` and the table if you prefer.
- The Privacy Policy page already says enquiries are stored in a database and forwarded on WhatsApp. Keep it accurate if you change providers.
