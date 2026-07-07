-- Allow contact form writes when the server only has the publishable/anon key (RLS blocks direct inserts).
-- Service role still preferred; this RPC runs as SECURITY DEFINER.

create or replace function public.submit_contact_submission(
  p_email text,
  p_name text default null,
  p_message text default ''
)
returns table (id uuid, email text, created_at timestamptz)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_email text := lower(trim(coalesce(p_email, '')));
  v_name text := nullif(trim(coalesce(p_name, '')), '');
  v_message text := trim(coalesce(p_message, ''));
  v_id uuid;
  v_created timestamptz;
begin
  if v_email = '' or position('@' in v_email) = 0 then
    raise exception 'Valid email is required' using errcode = '22023';
  end if;
  if char_length(v_message) < 10 then
    raise exception 'Message must be at least 10 characters' using errcode = '22023';
  end if;

  insert into public.contact_submissions (email, name, message)
  values (v_email, v_name, v_message)
  returning contact_submissions.id, contact_submissions.email, contact_submissions.created_at
  into v_id, v_email, v_created;

  return query select v_id, v_email, v_created;
end;
$$;

revoke all on function public.submit_contact_submission(text, text, text) from public;
grant execute on function public.submit_contact_submission(text, text, text) to anon, authenticated, service_role;
