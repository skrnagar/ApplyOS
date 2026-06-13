import { analyzeResumeFile } from "../../utils/runAtsAnalysis.js";

const MAX_BYTES = 8 * 1024 * 1024;

/** POST /api/resumes/analyze — extracts resume text and scores ATS compatibility */
export async function POST(request) {
  try {
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

    const emailRaw = formData.get("email");
    const email =
      typeof emailRaw === "string" && emailRaw.trim() ? emailRaw.trim().toLowerCase() : null;

    const buffer = Buffer.from(await file.arrayBuffer());
    const analysis = await analyzeResumeFile(buffer, {
      fileName,
      fileSize: file.size,
      mimeType: file.type,
      email,
    });

    return Response.json({
      ok: true,
      file_name: fileName,
      file_size: file.size,
      mime_type: file.type || null,
      ats_score: analysis.ats_score,
      ats_grade: analysis.ats_grade,
      ats_feedback: analysis.ats_feedback,
      ats_categories: analysis.ats_categories,
      ats_summary: analysis.ats_summary,
      extraction: analysis.extraction,
    });
  } catch (error) {
    console.error("POST /api/resumes/analyze:", error);
    return Response.json({ error: "Analysis failed" }, { status: 500 });
  }
}
