"use client";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import MarketingShell from "@/components/marketing/MarketingShell";
import AtsReportFull from "@/components/AtsReportFull";
import { loadAtsReport } from "@/utils/atsReportSession";
import { gradeFromScore } from "@/utils/atsScore";
import { metaForPath } from "@/utils/seo";

export function meta() {
  return metaForPath("/resume-checker/results");
}

export default function ResumeCheckerResultsPage() {
  const navigate = useNavigate();
  const [report, setReport] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const data = loadAtsReport();
    setReport(data);
    setReady(true);
  }, []);

  if (!ready) {
    return (
      <MarketingShell>
        <div className="pt-32 pb-20 container mx-auto px-5 max-w-4xl">
          <div className="h-64 rounded-2xl bg-neutral-100 animate-pulse" />
        </div>
      </MarketingShell>
    );
  }

  if (!report?.ats_score) {
    return (
      <MarketingShell>
        <div className="pt-32 pb-20 container mx-auto px-5 max-w-lg text-center">
          <h1 className="text-2xl font-bold text-neutral-900 mb-3">No report yet</h1>
          <p className="text-neutral-600 text-sm mb-6">
            Upload a resume on the checker page to see your full ATS breakdown.
          </p>
          <a
            href="/resume-checker"
            className="inline-flex px-6 py-3 rounded-xl bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700"
          >
            Check my resume
          </a>
        </div>
      </MarketingShell>
    );
  }

  return (
    <MarketingShell>
      <div className="pt-28 pb-20 md:pb-28">
        <div className="container mx-auto px-5 sm:px-6 max-w-5xl">
          <p className="text-xs uppercase tracking-[0.28em] text-emerald-700 font-semibold mb-4">
            ATS report
          </p>
          <AtsReportFull
            fileName={report.file_name}
            atsScore={report.ats_score}
            atsGrade={report.ats_grade || gradeFromScore(report.ats_score)}
            atsFeedback={report.ats_feedback}
            atsCategories={report.ats_categories}
            atsSummary={report.ats_summary}
            saved={report.saved !== false}
            guest={report.guest}
            source={report.source}
            onTryAnother={() => navigate("/resume-checker")}
          />
        </div>
      </div>
    </MarketingShell>
  );
}
