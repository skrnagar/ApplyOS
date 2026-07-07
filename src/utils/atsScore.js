import { analyzeResumeContent } from "@/utils/analyzeResumeContent";

/**
 * ATS scoring: file hygiene (30%) + parsed resume content (70%).
 * Content analysis differentiates resumes; metadata-only scoring clusters ~88% for PDFs.
 */
export function scoreResumeAts({ fileName, fileSize, mimeType, email, text, textExtracted = true }) {
  const feedback = [];
  const name = (fileName || "").toLowerCase();

  const metaCategories = {
    format: { label: "File format", score: 50 },
    size: { label: "File size", score: 50 },
    naming: { label: "File naming", score: 50 },
  };

  let metaPoints = 0;
  const metaMax = 30;

  // —— File format (0–10 meta points) ——
  if (name.endsWith(".pdf")) {
    metaPoints += 10;
    metaCategories.format.score = 100;
    feedback.push({
      type: "ok",
      category: "format",
      text: "PDF format — widely accepted by ATS systems.",
    });
  } else if (name.endsWith(".docx")) {
    metaPoints += 8;
    metaCategories.format.score = 85;
    feedback.push({
      type: "ok",
      category: "format",
      text: "DOCX parsed successfully. PDF is safer for conservative ATS.",
    });
  } else if (name.endsWith(".doc")) {
    metaPoints += 3;
    metaCategories.format.score = 40;
    feedback.push({
      type: "warn",
      category: "format",
      text: "Legacy .doc format — save as PDF or DOCX for reliable ATS parsing.",
    });
  } else {
    metaCategories.format.score = 20;
    feedback.push({
      type: "error",
      category: "format",
      text: "Unsupported format. Use PDF or DOCX.",
    });
  }

  // —— File size (0–10) ——
  if (fileSize) {
    const kb = fileSize / 1024;
    if (fileSize > 5 * 1024 * 1024) {
      metaPoints += 2;
      metaCategories.size.score = 40;
      feedback.push({
        type: "warn",
        category: "size",
        text: "File over 5 MB — many portals reject large uploads.",
      });
    } else if (fileSize > 2 * 1024 * 1024) {
      metaPoints += 6;
      metaCategories.size.score = 75;
      feedback.push({
        type: "tip",
        category: "size",
        text: "Under 2 MB is ideal for ATS portals.",
      });
    } else if (fileSize < 15 * 1024) {
      metaPoints += 3;
      metaCategories.size.score = 45;
      feedback.push({
        type: "warn",
        category: "size",
        text: "File very small — verify content exported correctly.",
      });
    } else {
      metaPoints += 10;
      metaCategories.size.score = 95;
      feedback.push({
        type: "ok",
        category: "size",
        text: `Healthy file size (${kb < 1024 ? `${Math.round(kb)} KB` : `${(kb / 1024).toFixed(1)} MB`}).`,
      });
    }
  }

  // —— Filename (0–10) ——
  if (/resume|cv/i.test(name)) {
    metaPoints += 10;
    metaCategories.naming.score = 95;
    feedback.push({
      type: "ok",
      category: "naming",
      text: "Filename clearly identifies this as a resume.",
    });
  } else if (/[\s]/.test(name) || name.length > 45) {
    metaPoints += 5;
    metaCategories.naming.score = 60;
    feedback.push({
      type: "tip",
      category: "naming",
      text: 'Use "FirstName-LastName-Resume.pdf" — avoid long names and spaces.',
    });
  } else {
    metaPoints += 7;
    metaCategories.naming.score = 72;
    feedback.push({
      type: "tip",
      category: "naming",
      text: "Rename file to include Resume or CV for recruiter filing systems.",
    });
  }

  metaPoints = Math.min(metaMax, metaPoints);

  // —— Content analysis (0–70 points) ——
  let contentAnalysis;
  if (text && text.trim().length > 0) {
    contentAnalysis = analyzeResumeContent(text);
    feedback.push(...contentAnalysis.feedback);
  } else if (!textExtracted) {
    contentAnalysis = {
      contentScore: 15,
      wordCount: 0,
      feedback: [],
      categories: [
        { id: "parse", label: "Text parseability", score: 10 },
        { id: "structure", label: "Section structure", score: 0 },
        { id: "contact", label: "Contact info", score: 0 },
        { id: "impact", label: "Impact & metrics", score: 0 },
        { id: "skills", label: "Skills & keywords", score: 0 },
      ],
    };
    feedback.push({
      type: "error",
      category: "parse",
      text: "Could not extract readable text. Your file may be a scanned image, use text boxes/tables, or multi-column layouts that break ATS parsers. Export a simple single-column PDF.",
    });
  } else {
    contentAnalysis = analyzeResumeContent("");
  }

  const contentPoints = Math.round((contentAnalysis.contentScore / 100) * 70);
  const finalScore = Math.min(98, Math.max(22, metaPoints + contentPoints));

  let grade = "Needs work";
  if (finalScore >= 85) grade = "Excellent";
  else if (finalScore >= 72) grade = "Good";
  else if (finalScore >= 58) grade = "Fair";

  const categoryList = [
    ...Object.entries(metaCategories).map(([id, c]) => ({
      id,
      label: c.label,
      score: c.score,
    })),
    ...(contentAnalysis.categories || []),
  ];

  if (email) {
    feedback.push({
      type: "ok",
      category: "contact",
      text: "Scan linked to your account for tracking improvements over time.",
    });
  }

  const summary = {
    passed: feedback.filter((f) => f.type === "ok").length,
    warnings: feedback.filter((f) => f.type === "warn" || f.type === "error").length,
    tips: feedback.filter((f) => f.type === "tip").length,
    word_count: contentAnalysis.wordCount,
    text_extracted: Boolean(text && text.trim().length > 30),
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
