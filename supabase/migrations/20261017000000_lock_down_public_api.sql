-- Hardening after the Supabase security advisor run (2026-10-17).

-- 1. rls_auto_enable() is an internal event-trigger helper created by the "automatic RLS" setting.
--    It must not be callable through the public REST API (/rest/v1/rpc/rls_auto_enable).
do $$
begin
  if exists (select 1 from pg_proc p join pg_namespace n on n.oid = p.pronamespace where n.nspname = 'public' and p.proname = 'rls_auto_enable') then
    revoke all on function public.rls_auto_enable() from public, anon, authenticated;
  end if;
end $$;

-- 2. Tables, sequences and functions created later in `public` get NO automatic access for the browser roles.
--    (Supabase grants them by default; this site never reads the database from the browser, only the Edge Function does.)
alter default privileges for role postgres in schema public revoke all on tables from anon, authenticated;
alter default privileges for role postgres in schema public revoke all on sequences from anon, authenticated;
alter default privileges for role postgres in schema public revoke execute on functions from anon, authenticated;

-- 3. Re-assert the enquiries lock-down (idempotent).
alter table public.enquiries enable row level security;
revoke all on public.enquiries from anon, authenticated;
