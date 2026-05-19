-- HireOrbit — run in Supabase SQL Editor (Dashboard → SQL)
-- Requires Storage bucket: resumes (public)

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

-- RLS (service role bypasses; anon/authenticated read own data when using Supabase Auth)
alter table public.profiles enable row level security;
alter table public.resumes enable row level security;
alter table public.leads enable row level security;
alter table public.contact_submissions enable row level security;
alter table public.chat_messages enable row level security;

-- Storage bucket (Dashboard → Storage → New bucket "resumes", public)
--
-- Env (web/.env.local):
--   NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
--   SUPABASE_SERVICE_ROLE_KEY, ADMIN_SECRET
--
-- Admin UI: http://localhost:4000/admin (enter ADMIN_SECRET)
