-- Phone on marketing leads and contact submissions (admin visibility)

alter table public.leads
  add column if not exists phone text;

alter table public.contact_submissions
  add column if not exists phone text;
