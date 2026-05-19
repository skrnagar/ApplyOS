/**
 * Lightweight ATS compatibility estimate (filename + file meta).
 * Replace with PDF text extraction when a parser is added.
 */
export function scoreResumeAts({ fileName, fileSize, mimeType }) {
  let score = 68;
  const feedback = [];
  const name = (fileName || "").toLowerCase();

  if (name.endsWith(".pdf")) {
    score += 12;
    feedback.push({ type: "ok", text: "PDF format is widely ATS-compatible." });
  } else if (name.endsWith(".docx")) {
    score += 8;
    feedback.push({ type: "ok", text: "DOCX is accepted by most ATS parsers." });
  } else if (name.endsWith(".doc")) {
    score += 4;
    feedback.push({ type: "warn", text: "Legacy .doc files may parse inconsistently — prefer PDF or DOCX." });
  } else {
    score -= 15;
    feedback.push({ type: "error", text: "Use PDF or DOCX for best ATS results." });
  }

  if (fileSize && fileSize > 2 * 1024 * 1024) {
    score -= 4;
    feedback.push({ type: "warn", text: "Large files can fail on some ATS portals — aim for under 2 MB." });
  } else if (fileSize && fileSize < 20 * 1024) {
    score -= 6;
    feedback.push({ type: "warn", text: "File looks very small — ensure content is not empty." });
  }

  if (/resume|cv/i.test(name)) {
    score += 5;
    feedback.push({ type: "ok", text: "Clear resume filename helps recruiters and ATS." });
  } else {
    feedback.push({ type: "tip", text: "Rename to FirstName-LastName-Resume.pdf for clarity." });
  }

  if (mimeType?.includes("pdf")) {
    score += 2;
  }

  const finalScore = Math.min(98, Math.max(38, Math.round(score)));

  return {
    ats_score: finalScore,
    ats_feedback: feedback,
  };
}
