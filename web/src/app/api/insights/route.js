import sql from "../utils/sql.js";
import { getOrCreateUser } from "../utils/getUser.js";
import { isNeonDatabaseConfigured } from "../utils/dbConfig.js";
import { resolveRequestProfile } from "../utils/supabaseUser.js";
import { getSupabaseAdmin, isSupabaseAdminConfigured } from "@/utils/supabase/admin";
import { generateInsights } from "@/utils/generateInsights";

async function loadInsightContext(request) {
  if (isSupabaseAdminConfigured()) {
    const profile = await resolveRequestProfile(request);
    if (!profile) return null;

    const admin = getSupabaseAdmin();
    const [resumesR, appsR] = await Promise.all([
      admin
        .from("resumes")
        .select("*")
        .eq("profile_id", profile.id)
        .order("created_at", { ascending: false }),
      admin
        .from("applications")
        .select("*")
        .eq("profile_id", profile.id)
        .order("created_at", { ascending: false }),
    ]);

    return {
      profile,
      resumes: resumesR.data || [],
      applications: appsR.data || [],
      preferences: profile.job_preferences,
    };
  }

  const user = await getOrCreateUser(request);
  if (!user) return null;

  if (user._neonLinked && isNeonDatabaseConfigured()) {
    const [resumes, applications] = await Promise.all([
      sql`SELECT * FROM resumes WHERE user_id = ${user.id} ORDER BY created_at DESC`,
      sql`SELECT * FROM applications WHERE user_id = ${user.id} ORDER BY created_at DESC`,
    ]);
    return {
      profile: user,
      resumes,
      applications,
      preferences: null,
    };
  }

  return { profile: user, resumes: [], applications: [], preferences: null };
}

export async function GET(request) {
  try {
    const ctx = await loadInsightContext(request);
    if (!ctx) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const insights = generateInsights(ctx);
    return Response.json(insights);
  } catch (error) {
    console.error("GET /api/insights:", error);
    return Response.json([]);
  }
}

export async function PATCH(request) {
  try {
    await request.json().catch(() => ({}));
    return Response.json({ success: true });
  } catch (error) {
    console.error("PATCH /api/insights:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
