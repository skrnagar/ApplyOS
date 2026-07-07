-- Run after 20250520120000_init_hireorbit.sql
-- Copies existing Supabase Auth users into public.profiles (signup before migration, etc.)

insert into public.profiles (auth_user_id, email, full_name)
select
  u.id,
  lower(trim(coalesce(u.email, ''))),
  coalesce(
    u.raw_user_meta_data->>'full_name',
    u.raw_user_meta_data->>'name',
    split_part(coalesce(u.email, ''), '@', 1)
  )
from auth.users u
where coalesce(u.email, '') <> ''
on conflict (auth_user_id) do update set
  email = excluded.email,
  full_name = coalesce(public.profiles.full_name, excluded.full_name);
