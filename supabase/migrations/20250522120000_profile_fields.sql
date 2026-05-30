-- Extended profile + job preferences (Supabase-native dashboard)

alter table public.profiles add column if not exists phone text;
alter table public.profiles add column if not exists profile_image text;
alter table public.profiles add column if not exists current_title text;
alter table public.profiles add column if not exists current_company text;
alter table public.profiles add column if not exists years_of_experience integer;
alter table public.profiles add column if not exists location text;
alter table public.profiles add column if not exists linkedin_url text;
alter table public.profiles add column if not exists github_url text;
alter table public.profiles add column if not exists portfolio_url text;
alter table public.profiles add column if not exists bio text;
alter table public.profiles add column if not exists job_preferences jsonb not null default '{}'::jsonb;
