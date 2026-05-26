-- HireOrbital initial schema + auth → profiles sync
-- Apply: Supabase Dashboard → SQL Editor → paste this file → Run
-- Then run: 20250520120100_backfill_profiles_from_auth.sql (if users already signed up)
-- Storage: create public bucket "resumes" in Dashboard → Storage

-- Profiles (app users; links Supabase Auth or local demo ids)
create table if not exists public.profiles (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid unique references auth.users (id) on delete set null,
  local_id text unique,
  email text not null,
  full_name text,
  onboarding_completed boolean default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists profiles_email_idx on public.profiles (email);
create index if not exists profiles_local_id_idx on public.profiles (local_id);

-- Resumes
create table if not exists public.resumes (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles (id) on delete cascade,
  file_name text not null,
  storage_path text,
  file_url text not null,
  file_size integer,
  mime_type text,
  ats_score integer,
  ats_feedback jsonb default '[]'::jsonb,
  is_primary boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists resumes_profile_id_idx on public.resumes (profile_id);

-- Marketing / popup leads
create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  name text,
  source text not null,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists leads_created_at_idx on public.leads (created_at desc);
create index if not exists leads_source_idx on public.leads (source);

-- Contact form
create table if not exists public.contact_submissions (
  id uuid primary key default gen_random_uuid(),
  name text,
  email text not null,
  message text not null,
  created_at timestamptz not null default now()
);

-- In-app chat
create table if not exists public.chat_messages (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles (id) on delete cascade,
  sender_type text not null check (sender_type in ('user', 'assistant', 'system')),
  content text not null,
  created_at timestamptz not null default now()
);

create index if not exists chat_messages_profile_id_idx on public.chat_messages (profile_id, created_at);

-- Job applications (see also 20250521120000_applications.sql)
create table if not exists public.applications (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles (id) on delete cascade,
  job_id text,
  company_name text not null,
  job_title text not null,
  job_location text,
  company_logo text,
  status text not null default 'applied',
  cover_letter text,
  notes text,
  source text,
  application_url text,
  applied_date timestamptz not null default now(),
  interview_date timestamptz,
  interview_type text,
  interview_notes text,
  offer_amount numeric,
  offer_currency text,
  rejection_reason text,
  position integer,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists applications_profile_id_idx on public.applications (profile_id, created_at desc);

drop trigger if exists applications_updated_at on public.applications;
create trigger applications_updated_at
  before update on public.applications
  for each row execute function public.set_updated_at();

alter table public.applications enable row level security;

-- updated_at trigger
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists profiles_updated_at on public.profiles;
create trigger profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- RLS
alter table public.profiles enable row level security;
alter table public.resumes enable row level security;
alter table public.leads enable row level security;
alter table public.contact_submissions enable row level security;
alter table public.chat_messages enable row level security;

-- New Supabase Auth user → row in public.profiles (APIs still merge by email for local demo)
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (auth_user_id, email, full_name)
  values (
    new.id,
    lower(trim(coalesce(new.email, ''))),
    coalesce(
      new.raw_user_meta_data->>'full_name',
      new.raw_user_meta_data->>'name',
      split_part(new.email, '@', 1)
    )
  )
  on conflict (auth_user_id) do update set
    email = excluded.email,
    full_name = coalesce(public.profiles.full_name, excluded.full_name);
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
