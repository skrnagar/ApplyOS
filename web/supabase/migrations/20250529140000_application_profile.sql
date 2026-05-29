-- Extended job-application data (Naukri, LinkedIn Easy Apply, Indeed, etc.)

alter table public.profiles
  add column if not exists application_profile jsonb not null default '{}'::jsonb;
