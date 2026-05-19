import sql from "../../utils/sql.js";
import { getOrCreateUser } from "../../utils/getUser.js";
import { getSupabaseAdmin, isSupabaseAdminConfigured } from "@/utils/supabase/admin";
import { resolveRequestProfile } from "../../utils/supabaseUser.js";

const BUCKET = "resumes";

export async function DELETE(request, { params }) {
  try {
    const { id } = params;

    if (isSupabaseAdminConfigured()) {
      const profile = await resolveRequestProfile(request);
      if (!profile) return Response.json({ error: "Unauthorized" }, { status: 401 });

      const admin = getSupabaseAdmin();
      const { data: row } = await admin
        .from("resumes")
        .select("*")
        .eq("id", id)
        .eq("profile_id", profile.id)
        .maybeSingle();

      if (!row) return Response.json({ error: "Resume not found" }, { status: 404 });

      if (row.storage_path) {
        await admin.storage.from(BUCKET).remove([row.storage_path]);
      }

      await admin.from("resumes").delete().eq("id", id);
      return Response.json({ success: true });
    }

    const user = await getOrCreateUser();
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
    const result =
      await sql`DELETE FROM resumes WHERE id = ${id} AND user_id = ${user.id} RETURNING *`;
    if (result.length === 0)
      return Response.json({ error: "Resume not found" }, { status: 404 });
    return Response.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/resumes/[id]:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(request, { params }) {
  try {
    const { id } = params;
    const body = await request.json();
    const { is_primary, ats_score } = body;

    if (isSupabaseAdminConfigured()) {
      const profile = await resolveRequestProfile(request);
      if (!profile) return Response.json({ error: "Unauthorized" }, { status: 401 });

      const admin = getSupabaseAdmin();
      if (is_primary) {
        await admin.from("resumes").update({ is_primary: false }).eq("profile_id", profile.id);
      }

      const updates = {};
      if (is_primary !== undefined) updates.is_primary = Boolean(is_primary);
      if (ats_score !== undefined) updates.ats_score = ats_score;

      const { data, error } = await admin
        .from("resumes")
        .update(updates)
        .eq("id", id)
        .eq("profile_id", profile.id)
        .select("*")
        .maybeSingle();

      if (error) throw error;
      if (!data) return Response.json({ error: "Resume not found" }, { status: 404 });

      return Response.json({
        id: data.id,
        user_id: data.profile_id,
        file_name: data.file_name,
        file_url: data.file_url,
        ats_score: data.ats_score,
        is_primary: data.is_primary,
        created_at: data.created_at,
      });
    }

    const user = await getOrCreateUser();
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
    if (is_primary) {
      await sql`UPDATE resumes SET is_primary = false WHERE user_id = ${user.id}`;
    }
    const updates = [];
    const values = [];
    let paramIndex = 1;
    if (is_primary !== undefined) {
      updates.push(`is_primary = $${paramIndex++}`);
      values.push(is_primary);
    }
    if (ats_score !== undefined) {
      updates.push(`ats_score = $${paramIndex++}`);
      values.push(ats_score);
    }
    updates.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(id);
    values.push(user.id);
    const updateQuery = `UPDATE resumes SET ${updates.join(", ")} WHERE id = $${paramIndex++} AND user_id = $${paramIndex} RETURNING *`;
    const result = await sql(updateQuery, values);
    if (result.length === 0)
      return Response.json({ error: "Resume not found" }, { status: 404 });
    return Response.json(result[0]);
  } catch (error) {
    console.error("PATCH /api/resumes/[id]:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
