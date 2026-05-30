import {
  getSupabaseAdmin,
  getServiceRoleKey,
  isSupabaseAdminConfigured,
  isValidServiceRoleKey,
} from "@/utils/supabase/admin";

/** GET /api/supabase/health — verify server can reach Supabase and tables exist */
export async function GET() {
  const rawServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  const serviceKeyValid = Boolean(getServiceRoleKey());

  if (!isSupabaseAdminConfigured() && !rawServiceKey) {
    return Response.json(
      {
        ok: false,
        configured: false,
        error: "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY",
      },
      { status: 503 },
    );
  }

  if (rawServiceKey && !isValidServiceRoleKey(rawServiceKey)) {
    return Response.json(
      {
        ok: false,
        configured: true,
        serviceRoleKeyValid: false,
        error:
          "SUPABASE_SERVICE_ROLE_KEY is not a service role secret. Use Project Settings → API → service_role (not publishable/anon).",
        hint: "Contact form and admin APIs cannot write until this is fixed, or apply contact RPC migration.",
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

  let writeOk = false;
  let writeMessage = null;
  const probeEmail = `health-probe-${Date.now()}@hireorbital.invalid`;
  const { data: probeRow, error: writeError } = await admin
    .from("contact_submissions")
    .insert({
      email: probeEmail,
      name: "Health probe",
      message: "Automated write probe — safe to delete.",
    })
    .select("id")
    .single();

  if (writeError) {
    writeMessage = writeError.message;
  } else if (probeRow?.id) {
    writeOk = true;
    await admin.from("contact_submissions").delete().eq("id", probeRow.id);
  }

  const tablesOk = Object.values(checks).every((c) => c.ok);
  const allOk = tablesOk && writeOk;

  return Response.json(
    {
      ok: allOk,
      configured: true,
      serviceRoleKeyValid: serviceKeyValid,
      tables: checks,
      write: writeOk ? { ok: true } : { ok: false, message: writeMessage },
      hint: allOk
        ? "Server can read and write to Supabase."
        : writeOk
          ? "Some tables are missing — run migrations in Supabase SQL Editor."
          : "Service role cannot insert — check SUPABASE_SERVICE_ROLE_KEY on Vercel.",
    },
    { status: allOk ? 200 : 500 },
  );
}
