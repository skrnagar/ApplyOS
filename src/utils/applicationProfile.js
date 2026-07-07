export const EMPTY_EDUCATION = {
  degree: "",
  field: "",
  institution: "",
  graduation_year: "",
  grade: "",
};

export const EMPTY_APPLICATION_PROFILE = {
  first_name: "",
  middle_name: "",
  last_name: "",
  date_of_birth: "",
  gender: "",
  nationality: "",
  marital_status: "",

  alternate_phone: "",
  address_line1: "",
  address_line2: "",
  city: "",
  state: "",
  country: "",
  postal_code: "",

  notice_period_days: "",
  current_salary: "",
  expected_salary: "",
  salary_currency: "USD",
  employment_status: "",
  experience_months: "",

  skills: [],
  headline: "",
  cover_letter: "",
  languages: [],

  work_authorization: "",
  visa_status: "",
  willing_to_relocate: false,

  education: [{ ...EMPTY_EDUCATION }],

  naukri_url: "",
  indeed_url: "",
  glassdoor_url: "",
  monster_url: "",
  shine_url: "",
  timesjobs_url: "",
  other_portal_url: "",

  references_note: "",
};

export const GENDER_OPTIONS = [
  { value: "", label: "Prefer not to say" },
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
  { value: "non_binary", label: "Non-binary" },
  { value: "other", label: "Other" },
];

export const MARITAL_OPTIONS = [
  { value: "", label: "Prefer not to say" },
  { value: "single", label: "Single" },
  { value: "married", label: "Married" },
  { value: "divorced", label: "Divorced" },
  { value: "widowed", label: "Widowed" },
];

export const EMPLOYMENT_STATUS_OPTIONS = [
  { value: "", label: "Select status" },
  { value: "employed", label: "Employed" },
  { value: "unemployed", label: "Unemployed / Job seeking" },
  { value: "student", label: "Student" },
  { value: "freelancer", label: "Freelancer / Consultant" },
  { value: "intern", label: "Intern" },
];

export const WORK_AUTH_OPTIONS = [
  { value: "", label: "Select authorization" },
  { value: "citizen", label: "Citizen / Permanent resident" },
  { value: "work_visa", label: "Work visa (no sponsorship needed)" },
  { value: "needs_sponsorship", label: "Needs visa sponsorship" },
  { value: "student_visa", label: "Student visa (OPT/CPT eligible)" },
  { value: "other", label: "Other" },
];

export const CURRENCY_OPTIONS = ["USD", "INR", "EUR", "GBP", "CAD", "AUD", "SGD", "AED"];

export const JOB_PORTAL_LINKS = [
  { key: "naukri_url", label: "Naukri", placeholder: "https://www.naukri.com/mnjuser/profile" },
  { key: "indeed_url", label: "Indeed", placeholder: "https://profile.indeed.com/..." },
  { key: "glassdoor_url", label: "Glassdoor", placeholder: "https://www.glassdoor.com/..." },
  { key: "monster_url", label: "Monster", placeholder: "https://www.monster.com/..." },
  { key: "shine_url", label: "Shine", placeholder: "https://www.shine.com/myshine/..." },
  { key: "timesjobs_url", label: "TimesJobs", placeholder: "https://www.timesjobs.com/..." },
  { key: "other_portal_url", label: "Other portal", placeholder: "AngelList, Hired, company portal…" },
];

function parseList(value) {
  if (Array.isArray(value)) return value.filter(Boolean);
  if (typeof value === "string" && value.trim()) {
    return value.split(",").map((s) => s.trim()).filter(Boolean);
  }
  return [];
}

export function normalizeApplicationProfile(raw = {}) {
  const education = Array.isArray(raw.education) && raw.education.length > 0
    ? raw.education.map((e) => ({ ...EMPTY_EDUCATION, ...e }))
    : [{ ...EMPTY_EDUCATION }];

  return {
    ...EMPTY_APPLICATION_PROFILE,
    ...raw,
    skills: parseList(raw.skills),
    languages: parseList(raw.languages),
    willing_to_relocate: Boolean(raw.willing_to_relocate),
    education,
  };
}

export function mergeApplicationProfile(existing = {}, updates = {}) {
  const base = normalizeApplicationProfile(existing);
  const next = { ...base, ...updates };

  if (updates.skills !== undefined) {
    next.skills = parseList(updates.skills);
  }
  if (updates.languages !== undefined) {
    next.languages = parseList(updates.languages);
  }
  if (updates.education !== undefined) {
    next.education = Array.isArray(updates.education) && updates.education.length > 0
      ? updates.education.map((e) => ({ ...EMPTY_EDUCATION, ...e }))
      : [{ ...EMPTY_EDUCATION }];
  }

  return next;
}
