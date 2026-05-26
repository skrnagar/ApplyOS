import { getSupabaseAdmin, isSupabaseAdminConfigured } from "@/utils/supabase/admin";
import { verifyAdminRequest } from "../../utils/adminAuth.js";
import { loadServerEnv } from "@/utils/loadServerEnv.js";

loadServerEnv();

/** PATCH /api/admin/profile — grant or revoke admin on a profile */
export async function PATCH(request) {
  const auth = await verifyAdminRequest(request);
  if (!auth.ok) {
    return Response.json({ error: auth.error, hint: auth.hint }, { status: auth.status });
  }

  if (!isSupabaseAdminConfigured()) {
    return Response.json({ error: "Supabase not configured" }, { status: 503 });
  }

  const body = await request.json();
  const { profileId, is_admin } = body;
  if (!profileId || typeof is_admin !== "boolean") {
    return Response.json({ error: "profileId and is_admin (boolean) required" }, { status: 400 });
  }

  const admin = getSupabaseAdmin();
  const { data, error } = await admin
    .from("profiles")
    .update({ is_admin })
    .eq("id", profileId)
    .select("id, email, full_name, is_admin")
    .single();

  if (error) {
    console.error("PATCH /api/admin/profile:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json({ profile: data });
}
