import { gradeFromScore } from "@/utils/atsScore";
import { hasApplicationTargets, normalizeJobPreferences } from "@/utils/jobPreferences";
import { normalizeApplicationProfile } from "@/utils/applicationProfile";

function priorityRank(p) {
  if (p === "high") return 1;
  if (p === "medium") return 2;
  return 3;
}

function topAtsTip(feedback) {
  if (!Array.isArray(feedback) || feedback.length === 0) return null;
  const warn = feedback.find((f) => f.type === "warn" || f.type === "error");
  if (warn) return warn.text;
  const tip = feedback.find((f) => f.type === "tip");
  return tip?.text || feedback[0]?.text;
}

/**
 * Build personalized insights from live profile, resume, preference, and application data.
 */
export function generateInsights({
  resumes = [],
  applications = [],
  preferences = null,
  profile = null,
} = {}) {
  const prefs = normalizeJobPreferences(preferences);
  const ap = normalizeApplicationProfile(profile?.application_profile);
  const now = new Date().toISOString();
  const insights = [];

  for (const resume of resumes) {
    const label = resume.job_profile_label?.trim() || resume.file_name || "Resume";
    const score = resume.ats_score ?? 0;
    const grade = resume.ats_grade || gradeFromScore(score);

    if (score > 0 && score < 72) {
      const tip = topAtsTip(resume.ats_feedback);
      insights.push({
        id: `resume-ats-${resume.id}`,
        insight_type: "resume",
        title: `Boost ATS score: ${label}`,
        content: [
          `This variant scored ${score}% (${grade}).`,
          tip,
          "Tailor keywords to match your target job profile before our team applies.",
        ]
          .filter(Boolean)
          .join(" "),
        priority: score < 58 ? "high" : "medium",
        action_href: "/dashboard/resumes",
        action_label: "View resume",
        created_at: resume.created_at || now,
      });
    } else if (score >= 85) {
      insights.push({
        id: `resume-strong-${resume.id}`,
        insight_type: "resume",
        title: `ATS-ready: ${label}`,
        content: `Scored ${score}% (${grade}) — good shape for LinkedIn, Naukri, and employer ATS portals.`,
        priority: "low",
        action_href: "/dashboard/resumes",
        action_label: "View details",
        created_at: resume.created_at || now,
      });
    }
  }

  if (resumes.length > 1) {
    const unlabeled = resumes.filter((r) => !r.job_profile_label?.trim());
    if (unlabeled.length > 0) {
      insights.push({
        id: "resume-label-missing",
        insight_type: "resume",
        title: "Label your resume variants",
        content: `You have ${resumes.length} resumes — add a job profile label (e.g. "Backend Engineer", "Product Manager") so our team uses the right version for each application.`,
        priority: "medium",
        action_href: "/dashboard/resumes",
        action_label: "Edit labels",
        created_at: now,
      });
    } else {
      insights.push({
        id: "resume-variants-ready",
        insight_type: "resume",
        title: `${resumes.length} tailored resume variants`,
        content: `Profiles: ${resumes.map((r) => r.job_profile_label).join(", ")}. Match each to roles in your application targets.`,
        priority: "low",
        action_href: "/dashboard/resumes",
        action_label: "Manage resumes",
        created_at: now,
      });
    }
  } else if (resumes.length === 0) {
    insights.push({
      id: "resume-upload-needed",
      insight_type: "resume",
      title: "Upload your first resume",
      content:
        "Add a PDF or DOCX to get an instant ATS score and actionable feedback. Upload separate variants for different job profiles.",
      priority: "high",
      action_href: "/dashboard/resumes",
      action_label: "Upload resume",
      created_at: now,
    });
  }

  if (!hasApplicationTargets(prefs)) {
    insights.push({
      id: "prefs-set-targets",
      insight_type: "application",
      title: "Set what we should apply for",
      content:
        "Add target roles, locations, and application types on the Applications page so our team applies to the right jobs.",
      priority: "high",
      action_href: "/dashboard/applications",
      action_label: "Set targets",
      created_at: now,
    });
  } else if (prefs.target_roles.length > 0) {
    insights.push({
      id: "prefs-roles-active",
      insight_type: "skill",
      title: `Targeting: ${prefs.target_roles.slice(0, 3).join(", ")}${prefs.target_roles.length > 3 ? "…" : ""}`,
      content: [
        prefs.application_types.length
          ? `Types: ${prefs.application_types.slice(0, 4).join(", ")}.`
          : null,
        prefs.preferred_locations.length
          ? `Locations: ${prefs.preferred_locations.join(", ")}.`
          : null,
        "Align resume keywords with these targets for better ATS match rates.",
      ]
        .filter(Boolean)
        .join(" "),
      priority: "medium",
      action_href: "/dashboard/applications",
      action_label: "Edit targets",
      created_at: now,
    });
  }

  if (applications.length === 0) {
    insights.push({
      id: "apps-pipeline-empty",
      insight_type: "application",
      title: "Application pipeline starting",
      content:
        "No applications logged yet. Once our team starts applying, status updates will appear on your Applications dashboard.",
      priority: "low",
      action_href: "/dashboard/applications",
      action_label: "View applications",
      created_at: now,
    });
  } else {
    const interviews = applications.filter(
      (a) => a.status === "interview" || a.status === "offer",
    ).length;
    const rejected = applications.filter((a) => a.status === "rejected").length;
    const rate = Math.round((interviews / applications.length) * 100);
    insights.push({
      id: "apps-pipeline-stats",
      insight_type: "application",
      title: "Application pipeline update",
      content: `${applications.length} roles submitted · ${interviews} at interview/offer stage (${rate}% progression)${rejected ? ` · ${rejected} closed` : ""}.`,
      priority: interviews === 0 && applications.length >= 5 ? "medium" : "low",
      action_href: "/dashboard/applications",
      action_label: "View all",
      created_at: applications[0]?.created_at || now,
    });
  }

  if (profile) {
    const missing = [];
    if (!profile.phone && !ap.alternate_phone) missing.push("phone");
    if (!profile.linkedin_url) missing.push("LinkedIn");
    if (!ap.skills?.length) missing.push("skills list");
    if (missing.length >= 2) {
      insights.push({
        id: "profile-incomplete",
        insight_type: "skill",
        title: "Complete your application profile",
        content: `Add ${missing.join(", ")} in Profile so our team can fill LinkedIn, Naukri, and company forms accurately.`,
        priority: "medium",
        action_href: "/dashboard/profile",
        action_label: "Complete profile",
        created_at: now,
      });
    }
  }

  const avgAts =
    resumes.length > 0
      ? Math.round(
          resumes.reduce((acc, r) => acc + (r.ats_score || 0), 0) / resumes.length,
        )
      : 0;

  if (resumes.length >= 2 && avgAts > 0) {
    const best = [...resumes].sort((a, b) => (b.ats_score || 0) - (a.ats_score || 0))[0];
    const worst = [...resumes].sort((a, b) => (a.ats_score || 0) - (b.ats_score || 0))[0];
    if ((best.ats_score || 0) - (worst.ats_score || 0) >= 10) {
      insights.push({
        id: "resume-spread",
        insight_type: "resume",
        title: "Resume quality gap between variants",
        content: `"${best.job_profile_label || best.file_name}" (${best.ats_score}%) outperforms "${worst.job_profile_label || worst.file_name}" (${worst.ats_score}%). Apply the stronger formatting to other variants.`,
        priority: "medium",
        action_href: "/dashboard/resumes",
        action_label: "Compare resumes",
        created_at: now,
      });
    }
  }

  return insights.sort(
    (a, b) =>
      priorityRank(a.priority) - priorityRank(b.priority) ||
      new Date(b.created_at) - new Date(a.created_at),
  );
}

export function insightsSummary(insights = []) {
  return {
    total: insights.length,
    high: insights.filter((i) => i.priority === "high").length,
    medium: insights.filter((i) => i.priority === "medium").length,
    low: insights.filter((i) => i.priority === "low").length,
    resume: insights.filter((i) => i.insight_type === "resume").length,
  };
}
