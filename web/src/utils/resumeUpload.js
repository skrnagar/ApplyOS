import { addLocalResume } from "@/utils/localResumes";
import { getApiAuthHeaders } from "@/utils/apiAuthHeaders";

export const RESUME_MAX_BYTES = 8 * 1024 * 1024;
export const RESUME_ACCEPT = ".pdf,.doc,.docx";
const ALLOWED_EXT = [".pdf", ".doc", ".docx"];

export function validateResumeFile(file) {
  if (!file) return { ok: false, error: null };
  if (file.size > RESUME_MAX_BYTES) {
    return {
      ok: false,
      error: "File too large. Please upload files up to 8 MB.",
    };
  }
  const name = file.name.toLowerCase();
  if (!ALLOWED_EXT.some((ext) => name.endsWith(ext))) {
    return {
      ok: false,
      error: "Only PDF, DOC, and DOCX files are supported.",
    };
  }
  return { ok: true };
}

/** Upload file to Supabase via POST /api/resumes/upload */
export async function uploadResumeToStorage(file) {
  const formData = new FormData();
  formData.append("file", file);
  const response = await fetch("/api/resumes/upload", {
    method: "POST",
    headers: await getApiAuthHeaders(),
    body: formData,
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error || "Upload failed");
  }
  return data;
}

/**
 * Save resume: Supabase storage + DB row, then JSON API fallback, then local storage.
 */
export async function saveResumeRecord(file, userId, existingCount) {
  try {
    const data = await uploadResumeToStorage(file);
    return { resume: data.resume, resumes: null, source: data.source || "supabase" };
  } catch (storageErr) {
    const msg = storageErr?.message || "";
    const canFallback =
      msg.includes("not configured") ||
      msg.includes("Unauthorized") ||
      msg.includes("503");
    if (!canFallback) throw storageErr;
  }

  const payload = {
    file_name: file.name,
    file_url: `local://${file.name}`,
    file_size: file.size,
  };

  const response = await fetch("/api/resumes", {
    method: "POST",
    headers: await getApiAuthHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify(payload),
  });

  if (response.ok) {
    const created = await response.json();
    return { resume: created, resumes: null, source: "api" };
  }

  const localResume = {
    id: `local_${Date.now()}`,
    ...payload,
    is_primary: existingCount === 0,
    created_at: new Date().toISOString(),
  };
  const next = addLocalResume(userId, localResume);
  return { resume: localResume, resumes: next, source: "local" };
}
