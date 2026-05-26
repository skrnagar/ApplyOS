import { getSupabaseAdmin, isSupabaseAdminConfigured } from "@/utils/supabase/admin";

/** GET /api/supabase/health — verify server can reach Supabase and tables exist */
export async function GET() {
  if (!isSupabaseAdminConfigured()) {
    return Response.json(
      {
        ok: false,
        configured: false,
        error: "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY",
      },
      { status: 503 },
    );
  }

  const admin = getSupabaseAdmin();
  const tables = [
    "profiles",
    "leads",
    "contact_submissions",
    "resumes",
    "chat_messages",
    "applications",
  ];
  const checks = {};

  for (const table of tables) {
    const { error } = await admin.from(table).select("id").limit(1);
    checks[table] = error ? { ok: false, message: error.message } : { ok: true };
  }

  const allOk = Object.values(checks).every((c) => c.ok);

  return Response.json(
    {
      ok: allOk,
      configured: true,
      tables: checks,
      hint: allOk
        ? "Server can write to Supabase. Use forms or /admin to view data."
        : "Run web/supabase/migrations/20250520120000_init_hireorbit.sql in Supabase SQL Editor.",
    },
    { status: allOk ? 200 : 500 },
  );
}
