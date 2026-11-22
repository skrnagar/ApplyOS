-- Lead capture fallback.
-- `leads` has RLS enabled and no insert policy, so inserts only work with a valid
-- service-role key. If SUPABASE_SERVICE_ROLE_KEY is missing/wrong on the host, every
-- popup / homepage / signup lead was silently dropped. This SECURITY DEFINER RPC lets
-- the API still store leads with only the publishable/anon key (same pattern as
-- submit_contact_submission).

alter table public.leads
  add column if not exists phone text;

create or replace function public.submit_lead(
  p_email text,
  p_name text default null,
  p_phone text default null,
  p_source text default 'unknown',
  p_metadata jsonb default '{}'::jsonb
)
returns table (id uuid, email text, phone text, source text, created_at timestamptz)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_email text := lower(trim(coalesce(p_email, '')));
  v_id uuid;
  v_phone text;
  v_source text;
  v_created timestamptz;
begin
  if v_email = '' or v_email !~ '^[^\s@]+@[^\s@]+\.[^\s@]+$' then
    raise exception 'Valid email is required' using errcode = '22023';
  end if;

  insert into public.leads (email, name, phone, source, metadata)
  values (
    v_email,
    nullif(trim(coalesce(p_name, '')), ''),
    nullif(trim(coalesce(p_phone, '')), ''),
    left(coalesce(nullif(trim(p_source), ''), 'unknown'), 64),
    coalesce(p_metadata, '{}'::jsonb)
  )
  returning leads.id, leads.phone, leads.source, leads.created_at
  into v_id, v_phone, v_source, v_created;

  return query select v_id, v_email, v_phone, v_source, v_created;
end;
$$;

revoke all on function public.submit_lead(text, text, text, text, jsonb) from public;
grant execute on function public.submit_lead(text, text, text, text, jsonb)
  to anon, authenticated, service_role;
