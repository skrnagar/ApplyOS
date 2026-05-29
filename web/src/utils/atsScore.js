/**
 * ATS compatibility scoring from file metadata (+ optional extracted text later).
 */
export function scoreResumeAts({ fileName, fileSize, mimeType, email }) {
  let score = 62;
  const feedback = [];
  const name = (fileName || "").toLowerCase();

  // —— File format ——
  if (name.endsWith(".pdf")) {
    score += 14;
    feedback.push({
      type: "ok",
      text: "PDF is the safest format — most ATS systems parse it reliably.",
    });
  } else if (name.endsWith(".docx")) {
    score += 10;
    feedback.push({
      type: "ok",
      text: "DOCX works on most ATS platforms; export a PDF copy for conservative employers.",
    });
  } else if (name.endsWith(".doc")) {
    score += 3;
    feedback.push({
      type: "warn",
      text: "Legacy .doc files often break parsers — save as PDF or DOCX before applying.",
    });
  } else {
    score -= 18;
    feedback.push({
      type: "error",
      text: "Unsupported format. Upload PDF or DOCX for ATS compatibility.",
    });
  }

  // —— File size ——
  if (fileSize) {
    const kb = fileSize / 1024;
    if (fileSize > 5 * 1024 * 1024) {
      score -= 8;
      feedback.push({
        type: "warn",
        text: "File is over 5 MB — many portals reject large uploads. Compress or trim to under 2 MB.",
      });
    } else if (fileSize > 2 * 1024 * 1024) {
      score -= 3;
      feedback.push({
        type: "tip",
        text: "Under 2 MB is ideal for ATS portals and recruiter inboxes.",
      });
    } else if (fileSize < 15 * 1024) {
      score -= 10;
      feedback.push({
        type: "warn",
        text: "File looks very small — make sure the resume content exported correctly.",
      });
    } else {
      score += 4;
      feedback.push({
        type: "ok",
        text: "File size is in a healthy range for ATS uploads.",
      });
    }
    if (kb > 0) {
      feedback.push({
        type: "tip",
        text: `Current size: ${kb < 1024 ? `${Math.round(kb)} KB` : `${(kb / 1024).toFixed(1)} MB`}.`,
      });
    }
  }

  // —— Filename ——
  if (/resume|cv/i.test(name)) {
    score += 6;
    feedback.push({
      type: "ok",
      text: "Filename clearly identifies this as a resume — good for recruiters and filing systems.",
    });
  } else if (/[\s]/.test(name) || name.length > 40) {
    score -= 2;
    feedback.push({
      type: "tip",
      text: 'Use a clean name like "FirstName-LastName-Resume.pdf" — avoid spaces and long titles.',
    });
  } else {
    feedback.push({
      type: "tip",
      text: 'Rename to FirstName-LastName-Resume.pdf so recruiters find you faster.',
    });
  }

  // —— MIME sanity ——
  if (mimeType?.includes("pdf")) {
    score += 2;
  }

  // —— Best-practice checklist (always show actionable tips) ——
  feedback.push({
    type: "tip",
    text: "Use a single column, standard headings (Experience, Education, Skills) — tables and text boxes confuse parsers.",
  });
  feedback.push({
    type: "tip",
    text: "Lead with measurable outcomes: “Increased revenue 32%” beats “Responsible for sales.”",
  });
  feedback.push({
    type: "tip",
    text: "Mirror keywords from the job description in your summary and skills — without keyword stuffing.",
  });
  feedback.push({
    type: "tip",
    text: "Include email, phone, LinkedIn, and city/state on line one — avoid headers/footers ATS may skip.",
  });

  if (email) {
    feedback.push({
      type: "ok",
      text: "We’ll link this scan to your account so assistants can improve the next draft.",
    });
  }

  const finalScore = Math.min(96, Math.max(35, Math.round(score)));

  let grade = "Needs work";
  if (finalScore >= 85) grade = "Excellent";
  else if (finalScore >= 72) grade = "Good";
  else if (finalScore >= 58) grade = "Fair";

  return {
    ats_score: finalScore,
    ats_grade: grade,
    ats_feedback: feedback,
  };
}

export function gradeFromScore(score) {
  if (score == null) return "—";
  if (score >= 85) return "Excellent";
  if (score >= 72) return "Good";
  if (score >= 58) return "Fair";
  return "Needs work";
}
