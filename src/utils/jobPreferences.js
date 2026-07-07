/** Shared job / application target preferences (stored in profiles.job_preferences jsonb). */

export const APPLICATION_TYPES = [
  { id: "full_time", label: "Full-time" },
  { id: "part_time", label: "Part-time" },
  { id: "contract", label: "Contract" },
  { id: "internship", label: "Internship" },
  { id: "new_grad", label: "New grad / Entry" },
  { id: "mid_level", label: "Mid level" },
  { id: "senior", label: "Senior / Staff" },
  { id: "faang", label: "FAANG / Big tech" },
  { id: "startup", label: "Startup" },
  { id: "enterprise", label: "Enterprise" },
  { id: "remote_only", label: "Remote only" },
  { id: "hybrid_ok", label: "Hybrid OK" },
  { id: "onsite_ok", label: "On-site OK" },
  { id: "visa_sponsor", label: "Visa sponsorship" },
];

export const EMPTY_JOB_PREFERENCES = {
  application_types: [],
  target_roles: [],
  preferred_locations: [],
  work_mode: [],
  preferred_industries: [],
  min_salary: "",
  max_salary: "",
  currency: "USD",
  notice_period: "",
  company_size: [],
  visa_sponsorship: false,
  willing_to_relocate: false,
  additional_notes: "",
};

export function parsePreferenceList(value) {
  if (Array.isArray(value)) return value.filter(Boolean);
  if (typeof value === "string" && value.trim()) {
    return value.split(",").map((s) => s.trim()).filter(Boolean);
  }
  return [];
}

export function normalizeJobPreferences(raw) {
  if (!raw || typeof raw !== "object") return { ...EMPTY_JOB_PREFERENCES };
  return {
    ...EMPTY_JOB_PREFERENCES,
    ...raw,
    application_types: parsePreferenceList(raw.application_types),
    target_roles: parsePreferenceList(raw.target_roles),
    preferred_locations: parsePreferenceList(raw.preferred_locations),
    work_mode: parsePreferenceList(raw.work_mode),
    preferred_industries: parsePreferenceList(raw.preferred_industries),
    company_size: parsePreferenceList(raw.company_size),
    visa_sponsorship: Boolean(raw.visa_sponsorship),
    willing_to_relocate: Boolean(raw.willing_to_relocate),
  };
}

/** Deep-merge incoming patch into existing preferences (Supabase jsonb). */
export function mergeJobPreferences(existing, patch) {
  const base = normalizeJobPreferences(existing);
  const next = normalizeJobPreferences({ ...base, ...patch });

  if (patch?.application_types !== undefined) {
    next.application_types = parsePreferenceList(patch.application_types);
  }
  if (patch?.target_roles !== undefined) {
    next.target_roles = parsePreferenceList(patch.target_roles);
  }
  if (patch?.preferred_locations !== undefined) {
    next.preferred_locations = parsePreferenceList(patch.preferred_locations);
  }
  if (patch?.work_mode !== undefined) {
    next.work_mode = parsePreferenceList(patch.work_mode);
  }
  if (patch?.preferred_industries !== undefined) {
    next.preferred_industries = parsePreferenceList(patch.preferred_industries);
  }
  if (patch?.company_size !== undefined) {
    next.company_size = parsePreferenceList(patch.company_size);
  }

  next.updated_at = new Date().toISOString();
  return next;
}

export function applicationTypeLabel(id) {
  return APPLICATION_TYPES.find((t) => t.id === id)?.label || id;
}

export function hasApplicationTargets(prefs) {
  const p = normalizeJobPreferences(prefs);
  return (
    p.application_types.length > 0 ||
    p.target_roles.length > 0 ||
    p.preferred_locations.length > 0 ||
    p.work_mode.length > 0 ||
    Boolean(p.additional_notes?.trim())
  );
}

export function formatApplicationTargetsSummary(prefs, { maxRoles = 3 } = {}) {
  const p = normalizeJobPreferences(prefs);
  const parts = [
    ...p.application_types.map(applicationTypeLabel),
    ...p.target_roles.slice(0, maxRoles),
    ...p.preferred_locations.slice(0, 2),
    ...p.work_mode.map((m) => m.charAt(0).toUpperCase() + m.slice(1)),
  ].filter(Boolean);
  return parts.length ? parts.join(" · ") : "No targets set";
}
