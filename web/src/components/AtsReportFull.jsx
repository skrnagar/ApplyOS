"use client";
import React, { useMemo } from "react";
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  FileText,
  Info,
  RefreshCw,
  Sparkles,
} from "lucide-react";
import { gradeFromScore } from "@/utils/atsScore";
import useUser from "@/utils/useUser";

const TYPE_STYLES = {
  ok: {
    icon: CheckCircle2,
    label: "Passed",
    chip: "bg-emerald-100 text-emerald-800",
    row: "border-emerald-100 bg-emerald-50/60",
  },
  warn: {
    icon: AlertCircle,
    label: "Warning",
    chip: "bg-amber-100 text-amber-900",
    row: "border-amber-100 bg-amber-50/60",
  },
  error: {
    icon: AlertCircle,
    label: "Critical",
    chip: "bg-red-100 text-red-800",
    row: "border-red-100 bg-red-50/60",
  },
  tip: {
    icon: Info,
    label: "Tip",
    chip: "bg-neutral-100 text-neutral-700",
    row: "border-neutral-100 bg-neutral-50/80",
  },
};

function scoreColor(score) {
  if (score >= 85) return { ring: "stroke-emerald-500", text: "text-emerald-600", bar: "bg-emerald-500" };
  if (score >= 72) return { ring: "stroke-blue-500", text: "text-blue-600", bar: "bg-blue-500" };
  if (score >= 58) return { ring: "stroke-amber-500", text: "text-amber-600", bar: "bg-amber-500" };
  return { ring: "stroke-red-500", text: "text-red-600", bar: "bg-red-500" };
}

function ScoreRing({ score, size = 160 }) {
  const colors = scoreColor(score);
  const stroke = 10;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c - (score / 100) * c;

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="currentColor"
          strokeWidth={stroke}
          className="text-neutral-100"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
          className={colors.ring}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={`text-4xl font-bold leading-none ${colors.text}`}>{score ?? "—"}</span>
        <span className="text-[11px] font-semibold uppercase tracking-wider text-neutral-500 mt-1">
          ATS Score
        </span>
      </div>
    </div>
  );
}

function CategoryBar({ label, score }) {
  const colors = scoreColor(score);
  return (
    <div>
      <div className="flex justify-between text-sm mb-1.5">
        <span className="font-medium text-neutral-800">{label}</span>
        <span className={`font-semibold ${colors.text}`}>{score}%</span>
      </div>
      <div className="h-2 rounded-full bg-neutral-100 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ${colors.bar}`}
          style={{ width: `${Math.min(100, score)}%` }}
        />
      </div>
    </div>
  );
}

/**
 * Full-page ATS report (Enhancv-style breakdown + actionable feedback).
 */
export default function AtsReportFull({
  fileName,
  atsScore,
  atsGrade,
  atsFeedback = [],
  atsCategories = [],
  atsSummary,
  saved = false,
  guest = false,
  source,
  onTryAnother,
  compact = false,
}) {
  const { data: user, loading: authLoading } = useUser();
  const grade = atsGrade || gradeFromScore(atsScore);
  const feedback = Array.isArray(atsFeedback) ? atsFeedback : [];
  const showGuestCta = guest && !authLoading && !user?.email;
  const categories = atsCategories.length
    ? atsCategories
    : [
        { id: "format", label: "File format", score: atsScore },
        { id: "content", label: "Content readiness", score: Math.max(55, atsScore - 8) },
      ];

  const grouped = useMemo(() => {
    const byType = { ok: [], warn: [], error: [], tip: [] };
    for (const item of feedback) {
      const t = byType[item.type] ? item.type : "tip";
      byType[t].push(item);
    }
    return byType;
  }, [feedback]);

  const summary = atsSummary || {
    passed: grouped.ok.length,
    warnings: grouped.warn.length + grouped.error.length,
    tips: grouped.tip.length,
  };

  return (
    <div className={`space-y-8 ${compact ? "" : "pb-8"}`}>
      {/* Score hero */}
      <div className="rounded-2xl border border-neutral-200 bg-white shadow-sm overflow-hidden">
        <div className="grid lg:grid-cols-[auto_1fr] gap-8 p-6 sm:p-8 items-center">
          <div className="flex justify-center lg:justify-start">
            <ScoreRing score={atsScore} />
          </div>
          <div className="min-w-0 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-800 text-xs font-semibold mb-3">
              <Sparkles size={14} aria-hidden />
              Resume analysis complete
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 tracking-tight">
              Grade: {grade}
            </h1>
            <p className="text-neutral-600 mt-2 text-sm sm:text-base leading-relaxed">
              {atsScore >= 85
                ? "Strong ATS hygiene — your file should parse cleanly on LinkedIn, Naukri, and most employer portals."
                : atsScore >= 72
                  ? "Solid foundation — a few tweaks below can push you into the top tier for automated screening."
                  : "Several fixes recommended before applying at scale — work through the checklist below."}
            </p>
            <div className="flex items-center gap-2 mt-4 justify-center lg:justify-start text-sm text-neutral-700">
              <FileText size={16} className="text-neutral-400 shrink-0" />
              <span className="truncate font-medium">{fileName || "Your resume"}</span>
            </div>
            {saved ? (
              <p className="text-sm text-emerald-700 font-medium mt-2">Saved to your profile</p>
            ) : source === "local" ? (
              <p className="text-sm text-amber-700 font-medium mt-2">Saved on this device only</p>
            ) : null}
          </div>
        </div>

        {/* Summary chips */}
        <div className="grid grid-cols-3 border-t border-neutral-100 divide-x divide-neutral-100">
          {[
            { label: "Passed checks", value: summary.passed, color: "text-emerald-700" },
            { label: "Warnings", value: summary.warnings, color: "text-amber-700" },
            { label: "Tips", value: summary.tips, color: "text-neutral-600" },
          ].map(({ label, value, color }) => (
            <div key={label} className="px-4 py-4 text-center">
              <p className={`text-2xl font-bold ${color}`}>{value}</p>
              <p className="text-xs text-neutral-500 mt-0.5">{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Category breakdown */}
      <div className="rounded-2xl border border-neutral-200 bg-white p-6 sm:p-8 shadow-sm">
        <h2 className="text-lg font-semibold text-neutral-900 mb-5">Score breakdown</h2>
        <div className="grid sm:grid-cols-2 gap-5">
          {categories.map((cat) => (
            <CategoryBar key={cat.id} label={cat.label} score={cat.score} />
          ))}
        </div>
      </div>

      {/* Feedback sections */}
      <div className="grid lg:grid-cols-2 gap-6">
        {(grouped.ok.length > 0 || grouped.warn.length > 0 || grouped.error.length > 0) && (
          <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-neutral-900 mb-4">File & format checks</h2>
            <ul className="space-y-2">
              {[...grouped.ok, ...grouped.warn, ...grouped.error].map((item, i) => {
                const style = TYPE_STYLES[item.type] || TYPE_STYLES.tip;
                const Icon = style.icon;
                return (
                  <li
                    key={i}
                    className={`flex gap-3 text-sm leading-relaxed rounded-xl border px-4 py-3 ${style.row}`}
                  >
                    <Icon size={16} className="shrink-0 mt-0.5" aria-hidden />
                    <span>{item.text}</span>
                  </li>
                );
              })}
            </ul>
          </div>
        )}

        <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-neutral-900 mb-4">
            Content & keyword readiness
          </h2>
          <p className="text-xs text-neutral-500 mb-4">
            Same guidance we use for LinkedIn Easy Apply, Naukri, Indeed, and company ATS forms.
          </p>
          <ul className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
            {grouped.tip.map((item, i) => {
              const Icon = TYPE_STYLES.tip.icon;
              return (
                <li
                  key={i}
                  className="flex gap-3 text-sm leading-relaxed rounded-xl border border-neutral-100 bg-neutral-50/80 px-4 py-3"
                >
                  <Icon size={16} className="shrink-0 mt-0.5 text-neutral-500" aria-hidden />
                  <span>{item.text}</span>
                </li>
              );
            })}
          </ul>
        </div>
      </div>

      {/* CTAs */}
      {!compact && (
        <div className="rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-white p-6 sm:p-8">
          <h2 className="text-xl font-semibold text-neutral-900 mb-2">Next steps</h2>
          <p className="text-sm text-neutral-600 mb-6 max-w-2xl leading-relaxed">
            HireOrbital assistants can rewrite your resume for each role, apply on LinkedIn & Naukri,
            and track every application — starting from this scan.
          </p>
          <div className="flex flex-wrap gap-3">
            {showGuestCta ? (
              <>
                <a
                  href="/account/signup"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 transition-colors"
                >
                  Sign up free <ArrowRight size={16} />
                </a>
                <a
                  href="/account/signin"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-emerald-800 text-sm font-semibold border border-emerald-200 hover:bg-emerald-50 transition-colors"
                >
                  Log in
                </a>
              </>
            ) : (
              <>
                <a
                  href="/dashboard"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 transition-colors"
                >
                  Go to dashboard <ArrowRight size={16} />
                </a>
                <a
                  href="/dashboard/resumes"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-emerald-800 text-sm font-semibold border border-emerald-200 hover:bg-emerald-50 transition-colors"
                >
                  View resumes
                </a>
              </>
            )}
            {onTryAnother ? (
              <button
                type="button"
                onClick={onTryAnother}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-neutral-800 text-sm font-semibold border border-neutral-200 hover:bg-neutral-50 transition-colors"
              >
                <RefreshCw size={16} /> Check another resume
              </button>
            ) : (
              <a
                href="/resume-checker"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-neutral-800 text-sm font-semibold border border-neutral-200 hover:bg-neutral-50 transition-colors"
              >
                <RefreshCw size={16} /> Check another resume
              </a>
            )}
            <a
              href="/pricing"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-neutral-600 text-sm font-medium hover:text-neutral-900 transition-colors"
            >
              See plans
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
