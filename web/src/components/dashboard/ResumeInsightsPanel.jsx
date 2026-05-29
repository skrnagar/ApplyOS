"use client";
import React, { useEffect, useMemo, useState } from "react";
import { motion } from "motion/react";
import {
  Sparkles,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Lightbulb,
  Target,
  Award,
} from "lucide-react";
import { fetchWithAuth } from "@/utils/apiAuthHeaders";
import { insightsSummary } from "@/utils/generateInsights";

const iconMap = {
  resume: Award,
  market: TrendingUp,
  skill: Target,
  application: CheckCircle2,
  default: Lightbulb,
};

const priorityColors = {
  high: {
    bg: "bg-red-50",
    border: "border-red-200",
    text: "text-red-700",
    icon: "text-red-600",
  },
  medium: {
    bg: "bg-amber-50",
    border: "border-amber-200",
    text: "text-amber-800",
    icon: "text-amber-600",
  },
  low: {
    bg: "bg-blue-50",
    border: "border-blue-200",
    text: "text-blue-700",
    icon: "text-blue-600",
  },
};

const DISMISS_KEY = "hireorbital_dismissed_insights";

function loadDismissed() {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = sessionStorage.getItem(DISMISS_KEY);
    return new Set(raw ? JSON.parse(raw) : []);
  } catch {
    return new Set();
  }
}

function saveDismissed(set) {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(DISMISS_KEY, JSON.stringify([...set]));
  } catch {
    /* ignore */
  }
}

export default function ResumeInsightsPanel({ className = "" }) {
  const [insights, setInsights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dismissed, setDismissed] = useState(() => loadDismissed());

  useEffect(() => {
    void (async () => {
      try {
        const res = await fetchWithAuth("/api/insights");
        if (res.ok) setInsights(await res.json());
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const visible = useMemo(
    () => insights.filter((i) => !dismissed.has(i.id)),
    [insights, dismissed],
  );

  const summary = useMemo(() => insightsSummary(visible), [visible]);

  const handleDismiss = (id) => {
    const next = new Set(dismissed);
    next.add(id);
    setDismissed(next);
    saveDismissed(next);
  };

  if (loading) {
    return (
      <div className={`rounded-2xl border border-neutral-200 bg-white p-6 animate-pulse ${className}`}>
        <div className="h-6 bg-neutral-200 rounded w-40 mb-4" />
        <div className="space-y-3">
          <div className="h-20 bg-neutral-100 rounded-xl" />
          <div className="h-20 bg-neutral-100 rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <section id="insights" className={`space-y-4 scroll-mt-24 ${className}`}>
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-neutral-900 flex items-center gap-2">
            <Sparkles className="text-purple-600" size={22} />
            AI Insights
          </h2>
          <p className="text-sm text-neutral-600 mt-0.5">
            Personalized recommendations from your resumes, targets, and applications
          </p>
        </div>
        {visible.length > 0 && (
          <div className="flex gap-2 text-xs">
            <span className="px-2.5 py-1 rounded-full bg-purple-50 text-purple-800 font-medium border border-purple-100">
              {summary.total} active
            </span>
            {summary.high > 0 && (
              <span className="px-2.5 py-1 rounded-full bg-red-50 text-red-700 font-medium border border-red-100">
                {summary.high} high priority
              </span>
            )}
          </div>
        )}
      </div>

      {visible.length === 0 ? (
        <div className="rounded-2xl border border-neutral-200 bg-white p-8 text-center">
          <Sparkles className="mx-auto text-neutral-300 mb-3" size={40} />
          <p className="font-medium text-neutral-900">You&apos;re all caught up</p>
          <p className="text-sm text-neutral-500 mt-1">
            Upload resumes and set application targets to get new insights.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {visible.map((insight, index) => {
            const Icon = iconMap[insight.insight_type] || iconMap.default;
            const colors = priorityColors[insight.priority] || priorityColors.medium;

            return (
              <motion.div
                key={insight.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.04 }}
                className={`rounded-xl border bg-white overflow-hidden border-l-4 ${colors.border}`}
              >
                <div className="p-4 sm:p-5">
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-10 h-10 ${colors.bg} rounded-xl flex items-center justify-center shrink-0`}
                    >
                      <Icon className={colors.icon} size={20} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <h3 className="font-semibold text-neutral-900 text-sm sm:text-base">
                          {insight.title}
                        </h3>
                        <span
                          className={`px-2 py-0.5 rounded-md text-[10px] font-semibold uppercase ${colors.bg} ${colors.text}`}
                        >
                          {insight.priority}
                        </span>
                      </div>
                      <p className="text-sm text-neutral-700 leading-relaxed">
                        {insight.content}
                      </p>
                      <div className="flex flex-wrap items-center gap-3 mt-3">
                        {insight.action_href && (
                          <a
                            href={insight.action_href}
                            className="text-sm font-semibold text-blue-600 hover:text-blue-700"
                          >
                            {insight.action_label || "Take action"} →
                          </a>
                        )}
                        <span className="text-xs text-neutral-400 capitalize">
                          {insight.insight_type} insight
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDismiss(insight.id)}
                      className="p-1.5 hover:bg-neutral-100 rounded-lg text-neutral-400 hover:text-neutral-700 shrink-0"
                      aria-label="Dismiss insight"
                    >
                      <XCircle size={18} />
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </section>
  );
}
