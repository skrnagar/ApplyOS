import { addLocalResume } from "@/utils/localResumes";

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

export async function uploadResumeToUrl(file) {
  const formData = new FormData();
  formData.append("file", file);
  const uploadRes = await fetch("/_create/api/upload/", {
    method: "POST",
    body: formData,
  });
  if (!uploadRes.ok) throw new Error("upload-failed");
  const uploadData = await uploadRes.json();
  return uploadData?.url;
}

export function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });
}

export async function getResumeFileUrlWithFallback(file) {
  try {
    return await uploadResumeToUrl(file);
  } catch {
    return readFileAsDataUrl(file);
  }
}

export async function saveResumeRecord(file, fileUrl, userId, existingCount) {
  const payload = {
    file_name: file.name,
    file_url: fileUrl,
    file_size: file.size,
    ats_score: Math.floor(Math.random() * 30) + 70,
  };

  const response = await fetch("/api/resumes", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
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
