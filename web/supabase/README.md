# Supabase (CLI)

## Where app data lives

| Data | Storage |
|------|---------|
| Sign-in / passwords / sessions | **Supabase Auth** — built-in `auth.users` (no custom migration; managed in Dashboard → Authentication) |
| App profile (name, email link) | Postgres **`public.profiles`** — created automatically on signup via trigger, or by API on first upload/chat |
| View auth users | Supabase Dashboard → **Authentication** → Users |
| View app profiles | **`/admin`** → Signups tab, or Table Editor → `profiles` |
| Resumes (files) | **Supabase Storage** bucket `resumes` |
| Resume metadata + ATS | Postgres table `public.resumes` |
| Lead popup, signup, contact | Postgres table `public.leads` |
| Contact form messages | Postgres table `public.contact_submissions` |
| Dashboard chat | Postgres table `public.chat_messages` |
| Job applications | Postgres table `public.applications` |
| Profile + job preferences | `public.profiles` (+ `job_preferences` jsonb column) |
| Admin login | Supabase Auth email/password (`auth.users`) |
| Admin permission | `public.profiles.is_admin = true` (see migration `20250523120000_admin_on_profiles.sql`) |
| Admin view | `/admin` + `GET /api/admin/overview` (service role) |

Legacy **Neon** (`DATABASE_URL`) is only used if `AUTH_SECRET` + Auth.js paths are enabled; Supabase is the primary store when configured.

Team inbox for alerts: **hireorbit.1@gmail.com** (override with `ALERT_EMAIL` in `.env.local`).

Email alerts (leads, contact, chat, signups, resumes, applications) are sent via [Resend](https://resend.com) when `RESEND_API_KEY` is set. Without it, alerts are logged to the dev server console.

```bash
# web/.env.local
ALERT_EMAIL=hireorbit.1@gmail.com
RESEND_API_KEY=re_xxxxxxxx
RESEND_FROM=HireOrbital <onboarding@resend.dev>   # use a verified domain in production
```

Restart `npm run dev` after changing env vars.

## SEO

Set `NEXT_PUBLIC_SITE_URL=https://hireorbital.com` in production for canonical URLs, Open Graph, and sitemap. Public files: `public/robots.txt`, `public/sitemap.xml`. Dynamic sitemap: `GET /api/sitemap`.

---

Schema lives in `migrations/`. Apply it to your **hosted** project:

```bash
cd web
npx supabase login
npx supabase link --project-ref <YOUR_PROJECT_REF>
npm run db:push
```

If tables already exist, run newer files in **SQL Editor** (Dashboard → SQL), e.g. `migrations/20250521120000_applications.sql` and `migrations/20250522120000_profile_fields.sql`.

`<YOUR_PROJECT_REF>` is the id in your Supabase URL: `https://<ref>.supabase.co`.

**Local stack** (optional):

```bash
npx supabase start
```

**Types** (optional):

```bash
npx supabase gen types typescript --linked > src/utils/supabase/database.types.ts
```

**Storage:** create a public bucket named `resumes` (Dashboard → Storage) for resume uploads.

**Auth:** the app uses Supabase Auth when `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` are set. For local email/password, disable “Confirm email” under Authentication → Providers → Email until you configure SMTP, or users will need to confirm before sign-in.

Add **Redirect URLs** under Authentication → URL Configuration, e.g. `http://localhost:4000/**` and your production origin, so OAuth and email links return to the app.
