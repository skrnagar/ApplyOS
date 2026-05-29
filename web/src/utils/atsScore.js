/**
 * ATS compatibility scoring from file metadata (+ optional extracted text later).
 */
export function scoreResumeAts({ fileName, fileSize, mimeType, email }) {
  let score = 62;
  const feedback = [];
  const name = (fileName || "").toLowerCase();

  const categories = {
    format: { label: "File format", score: 70, weight: 0.28 },
    size: { label: "File size", score: 75, weight: 0.18 },
    naming: { label: "File naming", score: 72, weight: 0.14 },
    content: { label: "Content readiness", score: 68, weight: 0.4 },
  };

  // —— File format ——
  if (name.endsWith(".pdf")) {
    score += 14;
    categories.format.score = 96;
    feedback.push({
      type: "ok",
      category: "format",
      text: "PDF is the safest format — most ATS systems parse it reliably.",
    });
  } else if (name.endsWith(".docx")) {
    score += 10;
    categories.format.score = 88;
    feedback.push({
      type: "ok",
      category: "format",
      text: "DOCX works on most ATS platforms; export a PDF copy for conservative employers.",
    });
  } else if (name.endsWith(".doc")) {
    score += 3;
    categories.format.score = 58;
    feedback.push({
      type: "warn",
      category: "format",
      text: "Legacy .doc files often break parsers — save as PDF or DOCX before applying.",
    });
  } else {
    score -= 18;
    categories.format.score = 32;
    feedback.push({
      type: "error",
      category: "format",
      text: "Unsupported format. Upload PDF or DOCX for ATS compatibility.",
    });
  }

  // —— File size ——
  if (fileSize) {
    const kb = fileSize / 1024;
    if (fileSize > 5 * 1024 * 1024) {
      score -= 8;
      categories.size.score = 52;
      feedback.push({
        type: "warn",
        category: "size",
        text: "File is over 5 MB — many portals reject large uploads. Compress or trim to under 2 MB.",
      });
    } else if (fileSize > 2 * 1024 * 1024) {
      score -= 3;
      categories.size.score = 78;
      feedback.push({
        type: "tip",
        category: "size",
        text: "Under 2 MB is ideal for ATS portals and recruiter inboxes.",
      });
    } else if (fileSize < 15 * 1024) {
      score -= 10;
      categories.size.score = 45;
      feedback.push({
        type: "warn",
        category: "size",
        text: "File looks very small — make sure the resume content exported correctly.",
      });
    } else {
      score += 4;
      categories.size.score = 92;
      feedback.push({
        type: "ok",
        category: "size",
        text: "File size is in a healthy range for ATS uploads.",
      });
    }
    if (kb > 0) {
      feedback.push({
        type: "tip",
        category: "size",
        text: `Current size: ${kb < 1024 ? `${Math.round(kb)} KB` : `${(kb / 1024).toFixed(1)} MB`}.`,
      });
    }
  }

  // —— Filename ——
  if (/resume|cv/i.test(name)) {
    score += 6;
    categories.naming.score = 94;
    feedback.push({
      type: "ok",
      category: "naming",
      text: "Filename clearly identifies this as a resume — good for recruiters and filing systems.",
    });
  } else if (/[\s]/.test(name) || name.length > 40) {
    score -= 2;
    categories.naming.score = 68;
    feedback.push({
      type: "tip",
      category: "naming",
      text: 'Use a clean name like "FirstName-LastName-Resume.pdf" — avoid spaces and long titles.',
    });
  } else {
    categories.naming.score = 74;
    feedback.push({
      type: "tip",
      category: "naming",
      text: 'Rename to FirstName-LastName-Resume.pdf so recruiters find you faster.',
    });
  }

  // —— MIME sanity ——
  if (mimeType?.includes("pdf")) {
    score += 2;
    categories.format.score = Math.min(100, categories.format.score + 2);
  }

  // —— Content readiness checklist ——
  const contentTips = [
    {
      type: "tip",
      category: "content",
      text: "Use a single column, standard headings (Experience, Education, Skills) — tables and text boxes confuse parsers.",
    },
    {
      type: "tip",
      category: "content",
      text: "Lead with measurable outcomes: “Increased revenue 32%” beats “Responsible for sales.”",
    },
    {
      type: "tip",
      category: "content",
      text: "Mirror keywords from the job description in your summary and skills — without keyword stuffing.",
    },
    {
      type: "tip",
      category: "content",
      text: "Include email, phone, LinkedIn, and city/state on line one — avoid headers/footers ATS may skip.",
    },
    {
      type: "tip",
      category: "content",
      text: "List hard skills in a dedicated section — many ATS rank candidates on keyword matches.",
    },
    {
      type: "tip",
      category: "content",
      text: "Use standard fonts (Arial, Calibri, Helvetica) at 10–12 pt — decorative fonts break parsers.",
    },
  ];
  feedback.push(...contentTips);

  const contentOk = feedback.filter((f) => f.category === "content" && f.type === "ok").length;
  const contentWarn = feedback.filter((f) => f.category === "content" && f.type === "warn").length;
  categories.content.score = Math.min(
    92,
    Math.max(55, 72 + contentOk * 8 - contentWarn * 10),
  );

  if (email) {
    feedback.push({
      type: "ok",
      category: "content",
      text: "We’ll link this scan to your account so assistants can improve the next draft.",
    });
    categories.content.score = Math.min(100, categories.content.score + 4);
  }

  const finalScore = Math.min(96, Math.max(35, Math.round(score)));

  let grade = "Needs work";
  if (finalScore >= 85) grade = "Excellent";
  else if (finalScore >= 72) grade = "Good";
  else if (finalScore >= 58) grade = "Fair";

  const categoryList = Object.entries(categories).map(([id, c]) => ({
    id,
    label: c.label,
    score: Math.round(c.score),
  }));

  const summary = {
    passed: feedback.filter((f) => f.type === "ok").length,
    warnings: feedback.filter((f) => f.type === "warn" || f.type === "error").length,
    tips: feedback.filter((f) => f.type === "tip").length,
  };

  return {
    ats_score: finalScore,
    ats_grade: grade,
    ats_feedback: feedback,
    ats_categories: categoryList,
    ats_summary: summary,
  };
}

export function gradeFromScore(score) {
  if (score == null) return "—";
  if (score >= 85) return "Excellent";
  if (score >= 72) return "Good";
  if (score >= 58) return "Fair";
  return "Needs work";
}
