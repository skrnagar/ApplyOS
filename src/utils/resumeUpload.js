import { addLocalResume } from "@/utils/localResumes";
import { getApiAuthHeaders } from "@/utils/apiAuthHeaders";
import { gradeFromScore } from "@/utils/atsScore";
import { saveAtsReport, ATS_REPORT_KEY } from "@/utils/atsReportSession";

export const RESUME_MAX_BYTES = 8 * 1024 * 1024;
export const RESUME_ACCEPT = ".pdf,.doc,.docx";
const ALLOWED_EXT = [".pdf", ".doc", ".docx"];
/** @deprecated use ATS_REPORT_KEY */
const GUEST_ATS_KEY = ATS_REPORT_KEY;

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

export function validateGuestEmail(email) {
  const normalized = String(email || "").trim().toLowerCase();
  if (!normalized) {
    return { ok: false, error: "Enter your email to save your resume and ATS report." };
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized)) {
    return { ok: false, error: "Enter a valid email address." };
  }
  return { ok: true, email: normalized };
}

/** Instant ATS scan — no auth required */
export async function analyzeResumeFile(file, email) {
  const formData = new FormData();
  formData.append("file", file);
  if (email) formData.append("email", email);

  const response = await fetch("/api/resumes/analyze", {
    method: "POST",
    body: formData,
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error || "Analysis failed");
  }
  return data;
}

/** Upload file to Supabase via POST /api/resumes/upload */
export async function uploadResumeToStorage(file, email, jobProfileLabel, phone) {
  const formData = new FormData();
  formData.append("file", file);
  if (email) formData.append("email", email);
  if (phone) formData.append("phone", phone);
  if (jobProfileLabel?.trim()) {
    formData.append("job_profile_label", jobProfileLabel.trim());
  }

  const response = await fetch("/api/resumes/upload", {
    method: "POST",
    headers: await getApiAuthHeaders(),
    body: formData,
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const err = new Error(data.error || "Upload failed");
    err.code = data.code;
    err.status = response.status;
    err.ats_score = data.ats_score;
    err.ats_grade = data.ats_grade;
    err.ats_feedback = data.ats_feedback;
    err.analyzeOnly = data.analyzeOnly;
    err.hint = data.hint;
    throw err;
  }
  return data;
}

function stashGuestAts(payload) {
  saveAtsReport(payload);
}

/**
 * Full pipeline: analyze → Supabase storage + DB, then JSON API / local fallback.
 */
export async function saveResumeRecord(file, userId, existingCount, options = {}) {
  const guestEmail = options.email?.trim().toLowerCase() || null;
  const guestPhone = options.phone || null;
  const jobProfileLabel = options.job_profile_label?.trim() || null;

  const analysis = await analyzeResumeFile(file, guestEmail);

  try {
    const data = await uploadResumeToStorage(file, guestEmail, jobProfileLabel, guestPhone);
    if (typeof window !== "undefined") {
      sessionStorage.removeItem(GUEST_ATS_KEY);
    }
    const resume = {
      ...data.resume,
      ats_grade: data.resume?.ats_grade ?? gradeFromScore(data.resume?.ats_score),
    };
    return {
      resume,
      resumes: null,
      source: data.source || "supabase",
      guest: data.guest,
      ats_score: resume.ats_score ?? analysis.ats_score,
      ats_grade: resume.ats_grade ?? analysis.ats_grade,
      ats_feedback: resume.ats_feedback ?? analysis.ats_feedback,
      ats_categories: analysis.ats_categories,
      ats_summary: analysis.ats_summary,
      saved: true,
    };
  } catch (storageErr) {
    const ats = {
      ats_score: storageErr.ats_score ?? analysis.ats_score,
      ats_grade: storageErr.ats_grade ?? analysis.ats_grade,
      ats_feedback: storageErr.ats_feedback ?? analysis.ats_feedback,
    };

    if (storageErr.code === "AUTH_REQUIRED") {
      const err = new Error(storageErr.message);
      err.needEmail = true;
      Object.assign(err, ats);
      throw err;
    }

    const msg = storageErr?.message || "";
    const canFallback =
      storageErr.analyzeOnly ||
      storageErr.status === 503 ||
      msg.includes("not configured") ||
      msg.includes("503");

    if (!canFallback) {
      stashGuestAts({ ...ats, file_name: file.name, email: guestEmail });
      const err = new Error(storageErr.message);
      Object.assign(err, ats);
      throw err;
    }
  }

  const payload = {
    file_name: file.name,
    file_url: `local://${file.name}`,
    file_size: file.size,
    ats_score: analysis.ats_score,
    ats_feedback: analysis.ats_feedback,
  };

  const response = await fetch("/api/resumes", {
    method: "POST",
    headers: await getApiAuthHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify(payload),
  });

  if (response.ok) {
    const created = await response.json();
    const resume = {
      ...created,
      ats_grade: gradeFromScore(created.ats_score),
    };
    return {
      resume,
      resumes: null,
      source: "api",
      ats_score: resume.ats_score,
      ats_grade: resume.ats_grade,
      ats_feedback: resume.ats_feedback,
      ats_categories: analysis.ats_categories,
      ats_summary: analysis.ats_summary,
      saved: true,
    };
  }

  const localResume = {
    id: `local_${Date.now()}`,
    ...payload,
    job_profile_label: jobProfileLabel,
    ats_grade: analysis.ats_grade,
    is_primary: existingCount === 0,
    created_at: new Date().toISOString(),
  };
  const next = addLocalResume(userId, localResume);
  stashGuestAts({
    ...analysis,
    file_name: file.name,
    email: guestEmail,
    source: "local",
    saved: false,
  });

  return {
    resume: localResume,
    resumes: next,
    source: "local",
    ats_score: analysis.ats_score,
    ats_grade: analysis.ats_grade,
    ats_feedback: analysis.ats_feedback,
    ats_categories: analysis.ats_categories,
    ats_summary: analysis.ats_summary,
    saved: false,
  };
}
