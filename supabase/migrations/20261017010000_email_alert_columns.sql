-- Email alerts (Resend) are tracked per enquiry, like WhatsApp.
alter table public.enquiries
  add column if not exists email_sent  boolean not null default false,
  add column if not exists email_error text;

-- column additions keep the existing lock-down (RLS on, no access for anon/authenticated)
revoke all on public.enquiries from anon, authenticated;
