import sql from "../utils/sql.js";
import { getOrCreateUser } from "../utils/getUser.js";
import { getSupabaseAdmin, isSupabaseAdminConfigured } from "@/utils/supabase/admin";
import { resolveRequestProfile } from "../utils/supabaseUser.js";

import { gradeFromScore } from "@/utils/atsScore";

function mapResumeRow(row) {
  return {
    id: row.id,
    user_id: row.profile_id,
    profile_id: row.profile_id,
    file_name: row.file_name,
    file_url: row.file_url,
    storage_path: row.storage_path,
    file_size: row.file_size,
    mime_type: row.mime_type,
    ats_score: row.ats_score,
    ats_grade: row.ats_grade ?? gradeFromScore(row.ats_score),
    ats_feedback: row.ats_feedback,
    is_primary: row.is_primary,
    created_at: row.created_at,
  };
}

async function listFromSupabase(request) {
  const profile = await resolveRequestProfile(request);
  if (!profile) return null;
  const admin = getSupabaseAdmin();
  const { data, error } = await admin
    .from("resumes")
    .select("*")
    .eq("profile_id", profile.id)
    .order("is_primary", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data || []).map(mapResumeRow);
}

async function listFromNeon() {
  const user = await getOrCreateUser(request);
  if (!user) return null;
  const resumes =
    await sql`SELECT * FROM resumes WHERE user_id = ${user.id} ORDER BY is_primary DESC, created_at DESC`;
  return resumes;
}

export async function GET(request) {
  try {
    if (isSupabaseAdminConfigured()) {
      const rows = await listFromSupabase(request);
      if (rows) return Response.json(rows);
    }
    const neon = await listFromNeon();
    if (neon) return Response.json(neon);
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  } catch (error) {
    console.error("GET /api/resumes:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    if (isSupabaseAdminConfigured()) {
      const profile = await resolveRequestProfile(request);
      if (!profile) return Response.json({ error: "Unauthorized" }, { status: 401 });

      const body = await request.json();
      const { file_name, file_url, file_size, is_primary, ats_score, ats_feedback } = body;
      if (!file_name || !file_url) {
        return Response.json({ error: "Missing required fields" }, { status: 400 });
      }

      const admin = getSupabaseAdmin();
      if (is_primary) {
        await admin.from("resumes").update({ is_primary: false }).eq("profile_id", profile.id);
      }

      const { data, error } = await admin
        .from("resumes")
        .insert({
          profile_id: profile.id,
          file_name,
          file_url,
          file_size: file_size || null,
          is_primary: Boolean(is_primary),
          ats_score: ats_score ?? null,
          ats_feedback: ats_feedback ?? [],
        })
        .select("*")
        .single();

      if (error) throw error;
      return Response.json(mapResumeRow(data), { status: 201 });
    }

    const user = await getOrCreateUser(request);
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
    const body = await request.json();
    const { file_name, file_url, file_size, is_primary, ats_score } = body;
    if (!file_name || !file_url) {
      return Response.json({ error: "Missing required fields" }, { status: 400 });
    }
    if (is_primary) {
      await sql`UPDATE resumes SET is_primary = false WHERE user_id = ${user.id}`;
    }
    const result = await sql`
      INSERT INTO resumes (user_id, file_name, file_url, file_size, is_primary, ats_score)
      VALUES (${user.id}, ${file_name}, ${file_url}, ${file_size || null}, ${is_primary || false}, ${ats_score || null})
      RETURNING *
    `;
    return Response.json(result[0], { status: 201 });
  } catch (error) {
    console.error("POST /api/resumes:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
