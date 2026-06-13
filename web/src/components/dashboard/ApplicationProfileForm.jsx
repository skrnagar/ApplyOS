"use client";
import React from "react";
import {
  Briefcase,
  GraduationCap,
  Globe,
  Home,
  Link2,
  User,
} from "lucide-react";
import {
  CURRENCY_OPTIONS,
  EMPLOYMENT_STATUS_OPTIONS,
  GENDER_OPTIONS,
  JOB_PORTAL_LINKS,
  MARITAL_OPTIONS,
  WORK_AUTH_OPTIONS,
} from "@/utils/applicationProfile";

function Section({ icon: Icon, title, description, children }) {
  return (
    <div className="bg-white rounded-2xl border border-neutral-200 p-6">
      <div className="mb-4">
        <h2 className="font-semibold text-neutral-900 flex items-center gap-2">
          {Icon ? <Icon size={18} className="text-blue-600" /> : null}
          {title}
        </h2>
        {description ? (
          <p className="text-xs text-neutral-500 mt-1">{description}</p>
        ) : null}
      </div>
      {children}
    </div>
  );
}

function Field({ label, children, className = "" }) {
  return (
    <div className={className}>
      <label className="block text-xs font-medium text-neutral-500 mb-1.5 uppercase tracking-wider">
        {label}
      </label>
      {children}
    </div>
  );
}

export default function ApplicationProfileForm({
  applicationProfile,
  onChange,
  inputClass,
  selectClass,
}) {
  const ap = applicationProfile;
  const set = (patch) => onChange({ ...ap, ...patch });

  const setEducation = (index, patch) => {
    const education = [...(ap.education || [])];
    education[index] = { ...education[index], ...patch };
    set({ education });
  };

  const addEducation = () => {
    set({
      education: [
        ...(ap.education || []),
        { degree: "", field: "", institution: "", graduation_year: "", grade: "" },
      ],
    });
  };

  const removeEducation = (index) => {
    const education = [...(ap.education || [])];
    if (education.length <= 1) return;
    education.splice(index, 1);
    set({ education });
  };

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-blue-200/80 bg-blue-50/40 px-4 py-3 text-sm text-blue-900">
        <p className="font-medium">Application-ready profile</p>
        <p className="text-blue-800/90 mt-0.5 text-xs leading-relaxed">
          Fill this once — our team uses it for LinkedIn Easy Apply, Naukri, Indeed,
          company career pages, and other portals on your behalf.
        </p>
      </div>

      <Section
        icon={User}
        title="Personal details"
        description="Used on Naukri, LinkedIn, and most employer forms."
      >
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Field label="First name">
            <input
              value={ap.first_name || ""}
              onChange={(e) => set({ first_name: e.target.value })}
              placeholder="John"
              className={inputClass}
            />
          </Field>
          <Field label="Middle name">
            <input
              value={ap.middle_name || ""}
              onChange={(e) => set({ middle_name: e.target.value })}
              placeholder="Optional"
              className={inputClass}
            />
          </Field>
          <Field label="Last name">
            <input
              value={ap.last_name || ""}
              onChange={(e) => set({ last_name: e.target.value })}
              placeholder="Smith"
              className={inputClass}
            />
          </Field>
          <Field label="Date of birth">
            <input
              type="date"
              value={ap.date_of_birth || ""}
              onChange={(e) => set({ date_of_birth: e.target.value })}
              className={inputClass}
            />
          </Field>
          <Field label="Gender">
            <select
              value={ap.gender || ""}
              onChange={(e) => set({ gender: e.target.value })}
              className={selectClass}
            >
              {GENDER_OPTIONS.map((o) => (
                <option key={o.value || "blank"} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Marital status">
            <select
              value={ap.marital_status || ""}
              onChange={(e) => set({ marital_status: e.target.value })}
              className={selectClass}
            >
              {MARITAL_OPTIONS.map((o) => (
                <option key={o.value || "blank"} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Nationality" className="sm:col-span-2">
            <input
              value={ap.nationality || ""}
              onChange={(e) => set({ nationality: e.target.value })}
              placeholder="Indian, American, British…"
              className={inputClass}
            />
          </Field>
        </div>
      </Section>

      <Section
        icon={Home}
        title="Address & contact"
        description="Current address for applications that ask for location details."
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Alternate mobile">
            <input
              value={ap.alternate_phone || ""}
              onChange={(e) => set({ alternate_phone: e.target.value })}
              placeholder="+91 98765 43210"
              className={inputClass}
            />
          </Field>
          <Field label="Postal / PIN code">
            <input
              value={ap.postal_code || ""}
              onChange={(e) => set({ postal_code: e.target.value })}
              placeholder="94102 / 560001"
              className={inputClass}
            />
          </Field>
          <Field label="Address line 1" className="sm:col-span-2">
            <input
              value={ap.address_line1 || ""}
              onChange={(e) => set({ address_line1: e.target.value })}
              placeholder="Street address, apartment, suite"
              className={inputClass}
            />
          </Field>
          <Field label="Address line 2" className="sm:col-span-2">
            <input
              value={ap.address_line2 || ""}
              onChange={(e) => set({ address_line2: e.target.value })}
              placeholder="Landmark, area (optional)"
              className={inputClass}
            />
          </Field>
          <Field label="City">
            <input
              value={ap.city || ""}
              onChange={(e) => set({ city: e.target.value })}
              placeholder="Bengaluru"
              className={inputClass}
            />
          </Field>
          <Field label="State / Province">
            <input
              value={ap.state || ""}
              onChange={(e) => set({ state: e.target.value })}
              placeholder="Karnataka / California"
              className={inputClass}
            />
          </Field>
          <Field label="Country" className="sm:col-span-2">
            <input
              value={ap.country || ""}
              onChange={(e) => set({ country: e.target.value })}
              placeholder="India / United States"
              className={inputClass}
            />
          </Field>
        </div>
      </Section>

      <Section
        icon={Briefcase}
        title="Work & compensation"
        description="Salary, notice period, and employment details for job portals."
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Employment status">
            <select
              value={ap.employment_status || ""}
              onChange={(e) => set({ employment_status: e.target.value })}
              className={selectClass}
            >
              {EMPLOYMENT_STATUS_OPTIONS.map((o) => (
                <option key={o.value || "blank"} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Additional experience (months)">
            <input
              type="number"
              min="0"
              max="11"
              value={ap.experience_months ?? ""}
              onChange={(e) => set({ experience_months: e.target.value })}
              placeholder="6"
              className={inputClass}
            />
          </Field>
          <Field label="Notice period (days)">
            <input
              type="number"
              min="0"
              value={ap.notice_period_days ?? ""}
              onChange={(e) => set({ notice_period_days: e.target.value })}
              placeholder="30 / 60 / 90"
              className={inputClass}
            />
          </Field>
          <Field label="Salary currency">
            <select
              value={ap.salary_currency || "USD"}
              onChange={(e) => set({ salary_currency: e.target.value })}
              className={selectClass}
            >
              {CURRENCY_OPTIONS.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Current salary (CTC / annual)">
            <input
              value={ap.current_salary || ""}
              onChange={(e) => set({ current_salary: e.target.value })}
              placeholder="1200000 / 95000"
              className={inputClass}
            />
          </Field>
          <Field label="Expected salary">
            <input
              value={ap.expected_salary || ""}
              onChange={(e) => set({ expected_salary: e.target.value })}
              placeholder="1500000 / 120000"
              className={inputClass}
            />
          </Field>
          <Field label="Work authorization">
            <select
              value={ap.work_authorization || ""}
              onChange={(e) => set({ work_authorization: e.target.value })}
              className={selectClass}
            >
              {WORK_AUTH_OPTIONS.map((o) => (
                <option key={o.value || "blank"} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Visa / work permit details">
            <input
              value={ap.visa_status || ""}
              onChange={(e) => set({ visa_status: e.target.value })}
              placeholder="H1B, L1, F1 OPT, UK Skilled Worker…"
              className={inputClass}
            />
          </Field>
          <div className="sm:col-span-2">
            <label className="inline-flex items-center gap-2 text-sm text-neutral-700 cursor-pointer">
              <input
                type="checkbox"
                checked={Boolean(ap.willing_to_relocate)}
                onChange={(e) => set({ willing_to_relocate: e.target.checked })}
                className="rounded border-neutral-300 text-blue-600 focus:ring-blue-500"
              />
              Willing to relocate
            </label>
          </div>
          <Field label="LinkedIn headline" className="sm:col-span-2">
            <input
              value={ap.headline || ""}
              onChange={(e) => set({ headline: e.target.value })}
              placeholder="Senior Software Engineer | React & Node.js"
              className={inputClass}
            />
          </Field>
          <Field label="Key skills" className="sm:col-span-2">
            <input
              value={(ap.skills || []).join(", ")}
              onChange={(e) =>
                set({
                  skills: e.target.value
                    .split(",")
                    .map((s) => s.trim())
                    .filter(Boolean),
                })
              }
              placeholder="JavaScript, React, Python, SQL, AWS…"
              className={inputClass}
            />
            <p className="text-[11px] text-neutral-400 mt-1">Comma-separated</p>
          </Field>
          <Field label="Languages" className="sm:col-span-2">
            <input
              value={(ap.languages || []).join(", ")}
              onChange={(e) =>
                set({
                  languages: e.target.value
                    .split(",")
                    .map((s) => s.trim())
                    .filter(Boolean),
                })
              }
              placeholder="English, Hindi, Spanish…"
              className={inputClass}
            />
          </Field>
          <Field label="Default cover letter / summary" className="sm:col-span-2">
            <textarea
              value={ap.cover_letter || ""}
              onChange={(e) => set({ cover_letter: e.target.value })}
              rows={4}
              placeholder="Short professional summary or cover letter our team can paste into application forms…"
              className="w-full px-4 py-2.5 border border-neutral-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none text-sm resize-none transition-all"
            />
          </Field>
        </div>
      </Section>

      <Section
        icon={GraduationCap}
        title="Education"
        description="Highest qualification and additional degrees."
      >
        <div className="space-y-4">
          {(ap.education || []).map((edu, index) => (
            <div
              key={index}
              className="rounded-xl border border-neutral-100 bg-neutral-50/50 p-4 space-y-3"
            >
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-neutral-600 uppercase tracking-wide">
                  {index === 0 ? "Primary qualification" : `Education ${index + 1}`}
                </p>
                {index > 0 ? (
                  <button
                    type="button"
                    onClick={() => removeEducation(index)}
                    className="text-xs text-red-600 hover:text-red-700"
                  >
                    Remove
                  </button>
                ) : null}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Field label="Degree">
                  <input
                    value={edu.degree || ""}
                    onChange={(e) => setEducation(index, { degree: e.target.value })}
                    placeholder="B.Tech, MBA, B.Sc…"
                    className={inputClass}
                  />
                </Field>
                <Field label="Field / specialization">
                  <input
                    value={edu.field || ""}
                    onChange={(e) => setEducation(index, { field: e.target.value })}
                    placeholder="Computer Science, Finance…"
                    className={inputClass}
                  />
                </Field>
                <Field label="Institution" className="sm:col-span-2">
                  <input
                    value={edu.institution || ""}
                    onChange={(e) => setEducation(index, { institution: e.target.value })}
                    placeholder="University / college name"
                    className={inputClass}
                  />
                </Field>
                <Field label="Graduation year">
                  <input
                    value={edu.graduation_year || ""}
                    onChange={(e) => setEducation(index, { graduation_year: e.target.value })}
                    placeholder="2020"
                    className={inputClass}
                  />
                </Field>
                <Field label="Grade / CGPA / %">
                  <input
                    value={edu.grade || ""}
                    onChange={(e) => setEducation(index, { grade: e.target.value })}
                    placeholder="8.5 CGPA / 85%"
                    className={inputClass}
                  />
                </Field>
              </div>
            </div>
          ))}
          <button
            type="button"
            onClick={addEducation}
            className="text-sm font-medium text-blue-600 hover:text-blue-700"
          >
            + Add another degree
          </button>
        </div>
      </Section>

      <Section
        icon={Link2}
        title="Job portal profiles"
        description="Links to your profiles on Naukri, Indeed, and other boards."
      >
        <div className="space-y-3">
          {JOB_PORTAL_LINKS.map(({ key, label, placeholder }) => (
            <div key={key} className="flex items-center gap-3">
              <div className="w-24 shrink-0 text-xs font-medium text-neutral-600">
                {label}
              </div>
              <input
                value={ap[key] || ""}
                onChange={(e) => set({ [key]: e.target.value })}
                placeholder={placeholder}
                className={inputClass}
              />
            </div>
          ))}
        </div>
      </Section>

      <Section icon={Globe} title="References & notes">
        <Field label="References or additional notes for applications">
          <textarea
            value={ap.references_note || ""}
            onChange={(e) => set({ references_note: e.target.value })}
            rows={2}
            placeholder="Reference contacts, portfolio passwords (avoid sharing sensitive data), special instructions…"
            className="w-full px-4 py-2.5 border border-neutral-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none text-sm resize-none transition-all"
          />
        </Field>
      </Section>
    </div>
  );
}
