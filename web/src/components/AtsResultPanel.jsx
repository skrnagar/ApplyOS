"use client";
import React from "react";
import { AlertCircle, CheckCircle2, Info, Sparkles } from "lucide-react";
import { gradeFromScore } from "@/utils/atsScore";
import useUser from "@/utils/useUser";

const TYPE_STYLES = {
  ok: {
    icon: CheckCircle2,
    className: "text-emerald-700 bg-emerald-50 border-emerald-100",
  },
  warn: {
    icon: AlertCircle,
    className: "text-amber-800 bg-amber-50 border-amber-100",
  },
  error: {
    icon: AlertCircle,
    className: "text-red-800 bg-red-50 border-red-100",
  },
  tip: {
    icon: Info,
    className: "text-neutral-700 bg-neutral-50 border-neutral-100",
  },
};

function scoreRingClass(score) {
  if (score >= 85) return "text-emerald-600 border-emerald-200 bg-emerald-50";
  if (score >= 72) return "text-blue-600 border-blue-200 bg-blue-50";
  if (score >= 58) return "text-amber-600 border-amber-200 bg-amber-50";
  return "text-red-600 border-red-200 bg-red-50";
}

/**
 * ATS score + actionable feedback after resume scan.
 */
export default function AtsResultPanel({
  fileName,
  atsScore,
  atsGrade,
  atsFeedback = [],
  saved = false,
  guest = false,
  source,
  className = "",
}) {
  const { data: user, loading: authLoading } = useUser();
  const grade = atsGrade || gradeFromScore(atsScore);
  const feedback = Array.isArray(atsFeedback) ? atsFeedback : [];
  const showGuestCta = guest && saved && !authLoading && !user?.email;

  return (
    <div
      className={`rounded-xl border border-neutral-200 bg-white overflow-hidden ${className}`}
    >
      <div className="px-4 py-4 sm:px-5 border-b border-neutral-100 bg-neutral-50/80">
        <div className="flex items-start gap-4">
          <div
            className={`shrink-0 w-16 h-16 rounded-2xl border-2 flex flex-col items-center justify-center ${scoreRingClass(atsScore)}`}
          >
            <span className="text-xl font-bold leading-none">{atsScore ?? "—"}</span>
            <span className="text-[10px] font-semibold uppercase tracking-wide mt-0.5">
              ATS
            </span>
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <Sparkles size={16} className="text-emerald-600 shrink-0" aria-hidden />
              <p className="text-sm font-semibold text-neutral-900 truncate">
                {fileName || "Your resume"}
              </p>
            </div>
            <p className="text-sm text-neutral-600 mt-1">
              Grade: <span className="font-semibold text-neutral-900">{grade}</span>
              {saved ? (
                <span className="text-emerald-700 font-medium"> · Saved to your profile</span>
              ) : source === "local" ? (
                <span className="text-amber-700 font-medium"> · Saved on this device only</span>
              ) : null}
            </p>
          </div>
        </div>
      </div>

      {feedback.length > 0 && (
        <ul className="px-4 py-3 sm:px-5 space-y-2 max-h-64 overflow-y-auto">
          {feedback.map((item, i) => {
            const style = TYPE_STYLES[item.type] || TYPE_STYLES.tip;
            const Icon = style.icon;
            return (
              <li
                key={i}
                className={`flex gap-2.5 text-xs leading-relaxed rounded-lg border px-3 py-2.5 ${style.className}`}
              >
                <Icon size={14} className="shrink-0 mt-0.5" aria-hidden />
                <span>{item.text}</span>
              </li>
            );
          })}
        </ul>
      )}

      <div className="px-4 py-3 sm:px-5 border-t border-neutral-100 bg-neutral-50/50">
        <a
          href="/resume-checker/results"
          className="text-sm font-semibold text-emerald-700 hover:text-emerald-800"
        >
          View full ATS report →
        </a>
      </div>

      {showGuestCta && (
        <div className="px-4 py-4 sm:px-5 border-t border-neutral-100 bg-emerald-50/60">
          <p className="text-sm font-medium text-emerald-950 mb-3">
            Create a free account to unlock AI tailoring, job matching, and application tracking.
          </p>
          <div className="flex flex-wrap gap-2">
            <a
              href="/account/signup"
              className="inline-flex items-center justify-center px-4 py-2 rounded-lg bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 transition-colors"
            >
              Sign up free
            </a>
            <a
              href="/account/signin"
              className="inline-flex items-center justify-center px-4 py-2 rounded-lg bg-white text-emerald-800 text-sm font-semibold border border-emerald-200 hover:bg-emerald-50 transition-colors"
            >
              Log in
            </a>
          </div>
        </div>
      )}

      {!showGuestCta && saved && !authLoading && user?.email && (
        <div className="px-4 py-4 sm:px-5 border-t border-neutral-100 bg-emerald-50/60">
          <a
            href="/dashboard"
            className="inline-flex items-center justify-center px-4 py-2 rounded-lg bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 transition-colors"
          >
            Go to dashboard
          </a>
        </div>
      )}
    </div>
  );
}
