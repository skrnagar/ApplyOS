/**
 * Content-based ATS analysis from extracted resume text.
 */

const SECTION_PATTERNS = [
  { id: "experience", label: "Experience", patterns: [/\bexperience\b/i, /\bwork history\b/i, /\bemployment\b/i, /\bprofessional experience\b/i] },
  { id: "education", label: "Education", patterns: [/\beducation\b/i, /\bacademic\b/i, /\bqualification\b/i] },
  { id: "skills", label: "Skills", patterns: [/\bskills\b/i, /\btechnical skills\b/i, /\bcore competencies\b/i, /\btechnologies\b/i] },
  { id: "summary", label: "Summary", patterns: [/\bsummary\b/i, /\bprofile\b/i, /\bobjective\b/i, /\babout me\b/i] },
];

const ACTION_VERBS = [
  "achieved", "built", "created", "delivered", "designed", "developed", "drove", "engineered",
  "implemented", "improved", "increased", "launched", "led", "managed", "optimized", "reduced",
  "scaled", "shipped", "spearheaded", "streamlined",
];

const TECH_KEYWORDS = [
  "javascript", "typescript", "python", "java", "react", "node", "sql", "aws", "azure", "gcp",
  "docker", "kubernetes", "api", "rest", "graphql", "postgresql", "mongodb", "redis", "git",
  "agile", "scrum", "machine learning", "data analysis", "excel", "tableau", "figma",
  "html", "css", "c\\+\\+", "c#", "go", "rust", "kotlin", "swift", "flutter", "next.js",
  "vue", "angular", "spring", "django", "fastapi", "terraform", "ci/cd", "linux",
];

function countMatches(text, patterns) {
  return patterns.filter((p) => p.test(text)).length;
}

function countKeywordHits(lower, keywords) {
  let hits = 0;
  const found = [];
  for (const kw of keywords) {
    const re = new RegExp(`\\b${kw}\\b`, "i");
    if (re.test(lower)) {
      hits++;
      found.push(kw.replace(/\\\\/g, ""));
    }
  }
  return { hits, found };
}

export function analyzeResumeContent(rawText) {
  const text = (rawText || "").replace(/\s+/g, " ").trim();
  const lower = text.toLowerCase();
  const feedback = [];
  let score = 0;

  const categories = {
    parse: { label: "Text parseability", score: 0 },
    structure: { label: "Section structure", score: 0 },
    contact: { label: "Contact info", score: 0 },
    impact: { label: "Impact & metrics", score: 0 },
    skills: { label: "Skills & keywords", score: 0 },
  };

  const words = text.split(/\s+/).filter(Boolean);
  const wordCount = words.length;

  // —— Parseability (0–20) ——
  if (!text || wordCount < 30) {
    categories.parse.score = 8;
    score += 8;
    feedback.push({
      type: "error",
      category: "parse",
      text: "Very little text could be extracted. Your resume may be image-based, use complex tables, or have formatting ATS parsers cannot read.",
    });
  } else if (wordCount < 120) {
    categories.parse.score = 35;
    score += 12;
    feedback.push({
      type: "warn",
      category: "parse",
      text: `Only ~${wordCount} words detected — content looks thin. ATS and recruiters expect more detail in Experience and Skills.`,
    });
  } else if (wordCount > 1200) {
    categories.parse.score = 70;
    score += 16;
    feedback.push({
      type: "warn",
      category: "parse",
      text: `Resume is long (~${wordCount} words). Trim to 1–2 pages — dense resumes score lower with recruiters and some ATS.`,
    });
  } else {
    categories.parse.score = 95;
    score += 20;
    feedback.push({
      type: "ok",
      category: "parse",
      text: `ATS successfully parsed ~${wordCount} words of resume content.`,
    });
  }

  // —— Section structure (0–20) ——
  const foundSections = SECTION_PATTERNS.filter((s) =>
    s.patterns.some((p) => p.test(text)),
  );
  const sectionScore = Math.min(100, Math.round((foundSections.length / 4) * 100));
  categories.structure.score = sectionScore;

  if (foundSections.length >= 3) {
    score += 18;
    feedback.push({
      type: "ok",
      category: "structure",
      text: `Standard sections found: ${foundSections.map((s) => s.label).join(", ")}.`,
    });
  } else if (foundSections.length >= 1) {
    score += 10;
    feedback.push({
      type: "warn",
      category: "structure",
      text: `Missing key sections. Found: ${foundSections.map((s) => s.label).join(", ") || "none"}. Add clear headings: Experience, Education, Skills.`,
    });
  } else {
    score += 4;
    feedback.push({
      type: "error",
      category: "structure",
      text: "No standard section headings detected (Experience, Education, Skills). ATS relies on these labels to categorize your data.",
    });
  }

  // —— Contact info (0–15) ——
  const hasEmail = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/.test(text);
  const hasPhone = /(?:\+?\d{1,3}[-.\s]?)?(?:\(?\d{2,4}\)?[-.\s]?)?\d{3}[-.\s]?\d{3,4}\b/.test(text);
  const hasLinkedIn = /linkedin\.com/i.test(text);
  const hasLocation = /\b(?:remote|hybrid|onsite)\b/i.test(text) || /\b[A-Z][a-z]+,\s*[A-Z]{2}\b/.test(text);

  let contactPts = 0;
  if (hasEmail) contactPts += 5;
  if (hasPhone) contactPts += 4;
  if (hasLinkedIn) contactPts += 3;
  if (hasLocation) contactPts += 3;
  categories.contact.score = Math.min(100, Math.round((contactPts / 15) * 100));
  score += contactPts;

  if (hasEmail && hasPhone) {
    feedback.push({
      type: "ok",
      category: "contact",
      text: "Email and phone detected in the document body — good for ATS contact parsing.",
    });
  } else {
    const missing = [!hasEmail && "email", !hasPhone && "phone"].filter(Boolean).join(" and ");
    feedback.push({
      type: "warn",
      category: "contact",
      text: `Missing ${missing || "contact details"} in extractable text. Put email and phone in the main body, not only in headers/footers.`,
    });
  }
  if (!hasLinkedIn) {
    feedback.push({
      type: "tip",
      category: "contact",
      text: "Add your LinkedIn URL in the resume body — many ATS forms auto-fill from it.",
    });
  }

  // —— Impact & metrics (0–20) ——
  const metricPatterns = [
    /\b\d+%/,
    /\b\d+\s*(million|billion|k\b|m\b)\b/i,
    /\$\d/,
    /\b(increased|decreased|reduced|improved|grew|saved|generated)\b[^.]{0,40}\d/i,
    /\b\d+\+?\s*(years?|yrs?)\b/i,
  ];
  const metricHits = countMatches(text, metricPatterns);
  const verbHits = ACTION_VERBS.filter((v) => lower.includes(v)).length;

  const impactRaw = Math.min(20, metricHits * 5 + Math.min(verbHits, 5) * 2);
  categories.impact.score = Math.round((impactRaw / 20) * 100);
  score += impactRaw;

  if (metricHits >= 2) {
    feedback.push({
      type: "ok",
      category: "impact",
      text: `Quantified achievements detected (${metricHits} metric patterns). Numbers help ATS and recruiters rank impact.`,
    });
  } else {
    feedback.push({
      type: "warn",
      category: "impact",
      text: "Few measurable outcomes found. Add metrics: “Increased revenue 32%”, “Reduced latency 40%”, “Managed team of 8”.",
    });
  }

  if (verbHits >= 4) {
    feedback.push({
      type: "ok",
      category: "impact",
      text: `Strong action verbs present (${verbHits} found) — leads with outcomes, not duties.`,
    });
  } else {
    feedback.push({
      type: "tip",
      category: "impact",
      text: "Use stronger action verbs: Led, Built, Delivered, Optimized, Implemented.",
    });
  }

  // —— Skills & keywords (0–25) ——
  const { hits: skillHits, found: skillsFound } = countKeywordHits(lower, TECH_KEYWORDS);
  const hasSkillsSection = foundSections.some((s) => s.id === "skills");
  let skillsPts = Math.min(15, skillHits * 2);
  if (hasSkillsSection) skillsPts += 5;
  if (skillHits >= 8) skillsPts += 5;
  skillsPts = Math.min(25, skillsPts);
  categories.skills.score = Math.round((skillsPts / 25) * 100);
  score += skillsPts;

  if (skillHits >= 5) {
    feedback.push({
      type: "ok",
      category: "skills",
      text: `Technical keywords detected (${skillHits}): ${skillsFound.slice(0, 8).join(", ")}${skillsFound.length > 8 ? "…" : ""}.`,
    });
  } else {
    feedback.push({
      type: "warn",
      category: "skills",
      text: "Low keyword density for technical roles. Add a dedicated Skills section with tools and technologies from your target jobs.",
    });
  }

  // Year / date presence
  const yearMatches = text.match(/\b(19|20)\d{2}\b/g) || [];
  if (yearMatches.length >= 2) {
    feedback.push({
      type: "ok",
      category: "structure",
      text: "Employment or education dates detected — helps ATS build your timeline.",
    });
  } else {
    feedback.push({
      type: "tip",
      category: "structure",
      text: "Include date ranges (e.g. 2021 – 2024) for each role and degree.",
    });
  }

  // Keyword stuffing check
  const wordFreq = {};
  for (const w of lower.split(/\s+/)) {
    if (w.length < 4) continue;
    wordFreq[w] = (wordFreq[w] || 0) + 1;
  }
  const stuffed = Object.entries(wordFreq).find(([, c]) => c > 12);
  if (stuffed) {
    score -= 5;
    feedback.push({
      type: "warn",
      category: "skills",
      text: `Possible keyword stuffing: "${stuffed[0]}" appears ${stuffed[1]} times. ATS may flag repetitive text.`,
    });
  }

  const contentScore = Math.min(100, Math.max(0, Math.round((score / 100) * 100)));

  return {
    contentScore,
    wordCount,
    skillHits,
    sectionsFound: foundSections.map((s) => s.id),
    feedback,
    categories: Object.entries(categories).map(([id, c]) => ({
      id,
      label: c.label,
      score: c.score,
    })),
  };
}
