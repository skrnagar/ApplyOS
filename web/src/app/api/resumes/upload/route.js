import { getSupabaseAdmin, isSupabaseAdminConfigured } from "@/utils/supabase/admin";
import { resolveRequestProfile } from "../../utils/supabaseUser.js";
import { scoreResumeAts } from "@/utils/atsScore";
import { notifyResumeUpload } from "../../utils/notifyTeam.js";

const BUCKET = "resumes";
const MAX_BYTES = 8 * 1024 * 1024;

export async function POST(request) {
  if (!isSupabaseAdminConfigured()) {
    return Response.json(
      {
        error:
          "Resume storage is not configured. Add SUPABASE_SERVICE_ROLE_KEY and run supabase/schema.sql.",
      },
      { status: 503 },
    );
  }

  const profile = await resolveRequestProfile(request);
  if (!profile) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  let formData;
  try {
    formData = await request.formData();
  } catch {
    return Response.json({ error: "Invalid form data" }, { status: 400 });
  }

  const file = formData.get("file");
  if (!file || typeof file === "string") {
    return Response.json({ error: "No file provided" }, { status: 400 });
  }

  if (file.size > MAX_BYTES) {
    return Response.json({ error: "File too large (max 8 MB)" }, { status: 400 });
  }

  const fileName = file.name || "resume.pdf";
  const nameLower = fileName.toLowerCase();
  if (![".pdf", ".doc", ".docx"].some((ext) => nameLower.endsWith(ext))) {
    return Response.json({ error: "Only PDF, DOC, and DOCX are supported" }, { status: 400 });
  }

  const admin = getSupabaseAdmin();
  const safeName = fileName.replace(/[^a-zA-Z0-9._-]/g, "_");
  const storagePath = `${profile.id}/${Date.now()}-${safeName}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  const { error: uploadError } = await admin.storage.from(BUCKET).upload(storagePath, buffer, {
    contentType: file.type || "application/octet-stream",
    upsert: false,
  });

  if (uploadError) {
    console.error("storage upload:", uploadError);
    return Response.json(
      {
        error:
          uploadError.message?.includes("Bucket not found")
            ? 'Create a public Storage bucket named "resumes" in Supabase.'
            : "Upload to storage failed",
      },
      { status: 500 },
    );
  }

  const { data: publicUrlData } = admin.storage.from(BUCKET).getPublicUrl(storagePath);
  const fileUrl = publicUrlData.publicUrl;

  const { ats_score, ats_feedback } = scoreResumeAts({
    fileName,
    fileSize: file.size,
    mimeType: file.type,
  });

  const { count } = await admin
    .from("resumes")
    .select("*", { count: "exact", head: true })
    .eq("profile_id", profile.id);

  const isPrimary = !count;

  if (isPrimary) {
    await admin.from("resumes").update({ is_primary: false }).eq("profile_id", profile.id);
  }

  const { data: resume, error: insertError } = await admin
    .from("resumes")
    .insert({
      profile_id: profile.id,
      file_name: fileName,
      storage_path: storagePath,
      file_url: fileUrl,
      file_size: file.size,
      mime_type: file.type || null,
      ats_score,
      ats_feedback,
      is_primary: isPrimary,
    })
    .select("*")
    .single();

  if (insertError) {
    console.error("resume insert:", insertError);
    return Response.json({ error: "Failed to save resume record" }, { status: 500 });
  }

  void notifyResumeUpload({
    userEmail: profile.email,
    userName: profile.full_name,
    fileName,
    atsScore: ats_score,
  });

  const mapped = mapResumeRow(resume);
  return Response.json({ resume: mapped, source: "supabase" }, { status: 201 });
}

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
    ats_feedback: row.ats_feedback,
    is_primary: row.is_primary,
    created_at: row.created_at,
  };
}
