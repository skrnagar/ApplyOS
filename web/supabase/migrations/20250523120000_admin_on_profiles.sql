-- Admin access: flag on profiles (passwords stay in Supabase Auth → auth.users)

alter table public.profiles add column if not exists is_admin boolean not null default false;

create index if not exists profiles_is_admin_idx on public.profiles (is_admin) where is_admin = true;

-- Bootstrap your team (edit emails or run from Table Editor later)
update public.profiles
set is_admin = true
where lower(email) in (
  'hireorbit.1@gmail.com',
  'theskrnagar@gmail.com'
);
