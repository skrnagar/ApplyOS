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
| Admin view | `/admin` + `GET /api/admin/overview` (service role) |

Legacy **Neon** (`DATABASE_URL`) is only used if `AUTH_SECRET` + Auth.js paths are enabled; Supabase is the primary store when configured.

Team inbox for the site: **hireorbit.1@gmail.com** (see `src/config/site.js`). Form submissions are saved in Supabase; check `/admin` or the Supabase dashboard — email delivery to the inbox is not automatic unless you add a provider (e.g. Resend).

---

Schema lives in `migrations/`. Apply it to your **hosted** project:

```bash
cd web
npx supabase login
npx supabase link --project-ref <YOUR_PROJECT_REF>
npm run db:push
```

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
