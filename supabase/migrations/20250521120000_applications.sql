-- Job applications (Supabase-native; replaces Neon when DATABASE_URL is unset)

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
create index if not exists applications_profile_status_idx on public.applications (profile_id, status);

drop trigger if exists applications_updated_at on public.applications;
create trigger applications_updated_at
  before update on public.applications
  for each row execute function public.set_updated_at();

alter table public.applications enable row level security;
