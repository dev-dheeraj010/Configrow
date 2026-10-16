-- Configrow: every website enquiry is stored here.
create extension if not exists pgcrypto;

create type public.enquiry_status as enum ('new', 'contacted', 'won', 'lost', 'spam');

create table public.enquiries (
  id             uuid primary key default gen_random_uuid(),
  created_at     timestamptz not null default now(),
  name           text not null check (char_length(name) between 1 and 120),
  phone          text not null check (char_length(phone) between 8 and 30),
  email          text check (email is null or char_length(email) <= 254),
  message        text check (message is null or char_length(message) <= 4000),
  source_page    text,
  status         public.enquiry_status not null default 'new',
  notes          text,                          -- your own follow-up notes
  whatsapp_sent  boolean not null default false,
  whatsapp_error text,
  ip_hash        text,                          -- salted hash, used only for rate limiting
  user_agent     text
);

create index enquiries_created_at_idx on public.enquiries (created_at desc);
create index enquiries_status_idx     on public.enquiries (status);
create index enquiries_ip_hash_idx    on public.enquiries (ip_hash, created_at desc);

-- Lock the table down: nobody can read or write it from the browser.
-- Only the Edge Function (service role) inserts; you read it in the Supabase dashboard.
alter table public.enquiries enable row level security;
revoke all on public.enquiries from anon, authenticated;
