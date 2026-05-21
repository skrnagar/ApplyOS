# Supabase (CLI)

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
