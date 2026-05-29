import {
  getSupabaseAdmin,
  getServiceRoleKey,
} from "@/utils/supabase/admin";
import { ensureStorageBucket } from "@/utils/supabase/ensureStorageBucket";
import {
  resolveOrCreateGuestProfile,
  resolveRequestProfile,
} from "../../utils/supabaseUser.js";
import { scoreResumeAts } from "@/utils/atsScore";
import { notifyResumeUpload } from "../../utils/notifyTeam.js";

const BUCKET = "resumes";
const MAX_BYTES = 8 * 1024 * 1024;

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
    ats_grade: row.ats_grade,
    ats_feedback: row.ats_feedback,
    is_primary: row.is_primary,
    job_profile_label: row.job_profile_label ?? null,
    created_at: row.created_at,
  };
}

export async function POST(request) {
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

  const emailField = formData.get("email");
  const guestEmail =
    typeof emailField === "string" && emailField.trim() ? emailField.trim().toLowerCase() : null;

  const labelField = formData.get("job_profile_label");
  const jobProfileLabel =
    typeof labelField === "string" && labelField.trim() ? labelField.trim() : null;

  const { ats_score, ats_grade, ats_feedback } = scoreResumeAts({
    fileName,
    fileSize: file.size,
    mimeType: file.type,
    email: guestEmail,
  });

  if (!getServiceRoleKey()) {
    return Response.json(
      {
        error: "Resume storage is not configured on the server.",
        code: "STORAGE_NOT_CONFIGURED",
        analyzeOnly: true,
        ats_score,
        ats_grade,
        ats_feedback,
        file_name: fileName,
        hint: "Set SUPABASE_SERVICE_ROLE_KEY in Vercel (service_role secret, not publishable key).",
      },
      { status: 503 },
    );
  }

  let profile = await resolveRequestProfile(request);
  if (!profile && guestEmail) {
    profile = await resolveOrCreateGuestProfile(guestEmail);
  }

  if (!profile) {
    return Response.json(
      {
        error: "Add your email to save this resume, or sign in first.",
        code: "AUTH_REQUIRED",
        ats_score,
        ats_grade,
        ats_feedback,
        file_name: fileName,
      },
      { status: 401 },
    );
  }

  const admin = getSupabaseAdmin();
  if (!admin) {
    return Response.json(
      {
        error: "Server storage unavailable.",
        code: "STORAGE_NOT_CONFIGURED",
        ats_score,
        ats_grade,
        ats_feedback,
        file_name: fileName,
      },
      { status: 503 },
    );
  }

  const bucketResult = await ensureStorageBucket(admin, BUCKET, {
    public: true,
    fileSizeLimit: MAX_BYTES,
  });
  if (!bucketResult.ok) {
    return Response.json(
      {
        error:
          'Could not access Storage bucket "resumes". Create it in Supabase Dashboard → Storage.',
        ats_score,
        ats_grade,
        ats_feedback,
      },
      { status: 500 },
    );
  }

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
        ats_score,
        ats_grade,
        ats_feedback,
      },
      { status: 500 },
    );
  }

  const { data: publicUrlData } = admin.storage.from(BUCKET).getPublicUrl(storagePath);
  const fileUrl = publicUrlData.publicUrl;

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
      job_profile_label: jobProfileLabel,
    })
    .select("*")
    .single();

  if (insertError) {
    console.error("resume insert:", insertError);
    return Response.json(
      {
        error: "Failed to save resume record",
        ats_score,
        ats_grade,
        ats_feedback,
      },
      { status: 500 },
    );
  }

  void notifyResumeUpload({
    userEmail: profile.email,
    userName: profile.full_name,
    fileName,
    atsScore: ats_score,
  });

  if (guestEmail) {
    const { error: leadErr } = await admin.from("leads").insert({
      email: profile.email,
      name: profile.full_name,
      source: "resume_upload",
      metadata: {
        file_name: fileName,
        ats_score,
        ats_grade,
      },
    });
    if (leadErr) {
      console.warn("lead insert (resume_upload):", leadErr.message);
    }
  }

  const mapped = mapResumeRow({ ...resume, ats_grade });
  return Response.json(
    {
      resume: mapped,
      source: "supabase",
      guest: Boolean(guestEmail && !profile.auth_user_id),
      profile_email: profile.email,
    },
    { status: 201 },
  );
}
