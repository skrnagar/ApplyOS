-- Resume variants per job profile (e.g. Backend vs PM resume)

alter table public.resumes add column if not exists job_profile_label text;

create index if not exists resumes_profile_label_idx
  on public.resumes (profile_id, job_profile_label);
