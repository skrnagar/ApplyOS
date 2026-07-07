import { getSupabaseAdmin, isSupabaseAdminConfigured } from "@/utils/supabase/admin";
import { verifyAdminRequest, ADMIN_TABLES } from "../../utils/adminAuth.js";
import { loadServerEnv } from "@/utils/loadServerEnv.js";

loadServerEnv();

const BUCKET = "resumes";

export async function DELETE(request) {
  const auth = await verifyAdminRequest(request);
  if (!auth.ok) {
    return Response.json({ error: auth.error }, { status: auth.status });
  }

  if (!isSupabaseAdminConfigured()) {
    return Response.json({ error: "Supabase not configured" }, { status: 503 });
  }

  let table;
  let id;
  try {
    const url = new URL(request.url);
    table = url.searchParams.get("table");
    id = url.searchParams.get("id");
    if (!table || !id) {
      const body = await request.json();
      table = table || body?.table;
      id = id || body?.id;
    }
  } catch {
    /* query params only */
  }

  if (!table || !id || !ADMIN_TABLES.includes(table)) {
    return Response.json({ error: "Invalid table or id" }, { status: 400 });
  }

  const admin = getSupabaseAdmin();

  try {
    if (table === "resumes") {
      const { data: row } = await admin
        .from("resumes")
        .select("storage_path")
        .eq("id", id)
        .maybeSingle();
      if (row?.storage_path) {
        await admin.storage.from(BUCKET).remove([row.storage_path]);
      }
    }

    if (table === "profiles") {
      const { data: resumeRows } = await admin
        .from("resumes")
        .select("storage_path")
        .eq("profile_id", id);
      const paths = (resumeRows || []).map((r) => r.storage_path).filter(Boolean);
      if (paths.length) await admin.storage.from(BUCKET).remove(paths);
    }

    const { error } = await admin.from(table).delete().eq("id", id);
    if (error) {
      console.error("admin delete:", error);
      return Response.json({ error: error.message }, { status: 500 });
    }

    return Response.json({ ok: true, deleted: { table, id } });
  } catch (err) {
    console.error("DELETE /api/admin/record:", err);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
