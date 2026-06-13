import { getSupabaseAdmin, isSupabaseAdminConfigured } from "@/utils/supabase/admin";
import { gradeFromScore } from "@/utils/atsScore";
import { resolveRequestProfile } from "../../../utils/supabaseUser.js";
import { analyzeResumeFile } from "../../../utils/runAtsAnalysis.js";

const BUCKET = "resumes";

/** POST /api/resumes/[id]/reanalyze — re-run ATS on stored resume file */
export async function POST(request, { params }) {
  try {
    const { id } = params;

    if (!isSupabaseAdminConfigured()) {
      return Response.json({ error: "Storage not configured" }, { status: 503 });
    }

    const profile = await resolveRequestProfile(request);
    if (!profile) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const admin = getSupabaseAdmin();
    const { data: row, error: fetchError } = await admin
      .from("resumes")
      .select("*")
      .eq("id", id)
      .eq("profile_id", profile.id)
      .maybeSingle();

    if (fetchError) throw fetchError;
    if (!row) return Response.json({ error: "Resume not found" }, { status: 404 });
    if (!row.storage_path) {
      return Response.json({ error: "No stored file to analyze" }, { status: 400 });
    }

    const { data: fileData, error: downloadError } = await admin.storage
      .from(BUCKET)
      .download(row.storage_path);

    if (downloadError || !fileData) {
      console.error("reanalyze download:", downloadError);
      return Response.json({ error: "Could not download resume file" }, { status: 500 });
    }

    const buffer = Buffer.from(await fileData.arrayBuffer());
    const analysis = await analyzeResumeFile(buffer, {
      fileName: row.file_name,
      fileSize: row.file_size,
      mimeType: row.mime_type,
      email: profile.email,
    });

    const { data: updated, error: updateError } = await admin
      .from("resumes")
      .update({
        ats_score: analysis.ats_score,
        ats_feedback: analysis.ats_feedback,
      })
      .eq("id", id)
      .eq("profile_id", profile.id)
      .select("*")
      .single();

    if (updateError) throw updateError;

    return Response.json({
      resume: {
        id: updated.id,
        file_name: updated.file_name,
        file_url: updated.file_url,
        ats_score: updated.ats_score,
        ats_grade: gradeFromScore(updated.ats_score),
        ats_feedback: updated.ats_feedback,
        ats_categories: analysis.ats_categories,
        ats_summary: analysis.ats_summary,
        extraction: analysis.extraction,
        is_primary: updated.is_primary,
        job_profile_label: updated.job_profile_label,
        created_at: updated.created_at,
      },
    });
  } catch (error) {
    console.error("POST /api/resumes/[id]/reanalyze:", error);
    return Response.json({ error: "Re-analysis failed" }, { status: 500 });
  }
}
