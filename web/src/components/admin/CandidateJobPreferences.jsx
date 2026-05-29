"use client";
import React from "react";
import { Target } from "lucide-react";
import {
  APPLICATION_TYPES,
  formatApplicationTargetsSummary,
  hasApplicationTargets,
  normalizeJobPreferences,
} from "@/utils/jobPreferences";

/** Admin view of candidate "What should we apply for?" preferences. */
export default function CandidateJobPreferences({ jobPreferences, className = "" }) {
  const prefs = normalizeJobPreferences(jobPreferences);

  if (!hasApplicationTargets(prefs)) {
    return (
      <div
        className={`rounded-lg border border-amber-100 bg-amber-50/60 px-3 py-3 text-xs text-amber-900 ${className}`}
      >
        <p className="font-semibold flex items-center gap-1.5">
          <Target size={14} aria-hidden />
          Application targets
        </p>
        <p className="mt-1 text-amber-800/90">
          Candidate has not set what to apply for yet. Ask them to fill in{" "}
          <span className="font-medium">Dashboard → Applications</span>.
        </p>
      </div>
    );
  }

  return (
    <div
      className={`rounded-lg border border-blue-100 bg-blue-50/60 px-3 py-3 text-xs text-neutral-800 space-y-2.5 ${className}`}
    >
      <p className="font-semibold text-blue-900 flex items-center gap-1.5">
        <Target size={14} aria-hidden />
        What they want us to apply for
      </p>

      {prefs.application_types.length > 0 && (
        <div>
          <p className="text-neutral-500 mb-1">Application types</p>
          <div className="flex flex-wrap gap-1">
            {prefs.application_types.map((id) => (
              <span
                key={id}
                className="px-2 py-0.5 rounded-full bg-white border border-blue-200 text-[11px] font-medium text-blue-900"
              >
                {APPLICATION_TYPES.find((t) => t.id === id)?.label || id}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="grid sm:grid-cols-2 gap-x-4 gap-y-1">
        {prefs.target_roles.length > 0 && (
          <p>
            <span className="text-neutral-500">Roles:</span> {prefs.target_roles.join(", ")}
          </p>
        )}
        {prefs.preferred_locations.length > 0 && (
          <p>
            <span className="text-neutral-500">Locations:</span>{" "}
            {prefs.preferred_locations.join(", ")}
          </p>
        )}
        {prefs.work_mode.length > 0 && (
          <p>
            <span className="text-neutral-500">Work mode:</span>{" "}
            {prefs.work_mode.join(", ")}
          </p>
        )}
        {(prefs.min_salary || prefs.max_salary) && (
          <p>
            <span className="text-neutral-500">Salary:</span>{" "}
            {[prefs.min_salary, prefs.max_salary].filter(Boolean).join(" – ")}{" "}
            {prefs.currency || "USD"}
          </p>
        )}
        {prefs.notice_period && (
          <p>
            <span className="text-neutral-500">Notice:</span> {prefs.notice_period}
          </p>
        )}
        {prefs.visa_sponsorship && (
          <p>
            <span className="text-neutral-500">Visa:</span> Sponsorship needed
          </p>
        )}
        {prefs.willing_to_relocate && (
          <p>
            <span className="text-neutral-500">Relocate:</span> Yes
          </p>
        )}
      </div>

      {prefs.additional_notes?.trim() && (
        <p className="text-neutral-700 leading-relaxed border-t border-blue-100 pt-2">
          <span className="text-neutral-500 block mb-0.5">Notes</span>
          {prefs.additional_notes}
        </p>
      )}

      <p className="text-[10px] text-neutral-500 pt-1 border-t border-blue-100">
        Summary: {formatApplicationTargetsSummary(prefs)}
      </p>
    </div>
  );
}
