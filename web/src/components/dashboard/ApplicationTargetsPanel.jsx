"use client";
import React, { useEffect, useState } from "react";
import { CheckCircle, Save, Target } from "lucide-react";
import { fetchWithAuth } from "@/utils/apiAuthHeaders";
import useUser from "@/utils/useUser";

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

const EMPTY_PREFS = {
  application_types: [],
  target_roles: [],
  preferred_locations: [],
  work_mode: [],
  preferred_industries: [],
  additional_notes: "",
};

function parseList(value) {
  if (Array.isArray(value)) return value;
  if (typeof value === "string" && value.trim()) {
    return value.split(",").map((s) => s.trim()).filter(Boolean);
  }
  return [];
}

export default function ApplicationTargetsPanel({ className = "" }) {
  const { data: authUser, loading: authLoading } = useUser();
  const [prefs, setPrefs] = useState(EMPTY_PREFS);
  const [fullPrefs, setFullPrefs] = useState({});
  const [rolesInput, setRolesInput] = useState("");
  const [locationsInput, setLocationsInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (authLoading) return;
    if (!authUser?.email) return;
    void loadPrefs();
  }, [authLoading, authUser?.email]);

  const loadPrefs = async () => {
    try {
      const res = await fetchWithAuth("/api/preferences");
      if (res.ok) {
        const data = await res.json();
        if (data) {
          setFullPrefs(data);
          setPrefs({
            ...EMPTY_PREFS,
            ...data,
            application_types: parseList(data.application_types),
            target_roles: parseList(data.target_roles),
            preferred_locations: parseList(data.preferred_locations),
            work_mode: parseList(data.work_mode),
            preferred_industries: parseList(data.preferred_industries),
          });
          setRolesInput(parseList(data.target_roles).join(", "));
          setLocationsInput(parseList(data.preferred_locations).join(", "));
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const toggleType = (id) => {
    setPrefs((prev) => {
      const has = prev.application_types.includes(id);
      return {
        ...prev,
        application_types: has
          ? prev.application_types.filter((t) => t !== id)
          : [...prev.application_types, id],
      };
    });
    setSaved(false);
  };

  const toggleWorkMode = (mode) => {
    setPrefs((prev) => {
      const has = prev.work_mode.includes(mode);
      return {
        ...prev,
        work_mode: has
          ? prev.work_mode.filter((m) => m !== mode)
          : [...prev.work_mode, mode],
      };
    });
    setSaved(false);
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    const payload = {
      ...fullPrefs,
      ...prefs,
      target_roles: rolesInput
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      preferred_locations: locationsInput
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
    };

    try {
      const res = await fetchWithAuth("/api/preferences", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        const data = await res.json();
        setFullPrefs(data);
        setPrefs((prev) => ({ ...prev, ...data }));
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      } else {
        const data = await res.json().catch(() => ({}));
        setError(data.error || "Could not save. Try again.");
      }
    } catch (e) {
      setError("Could not save. Try again.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className={`rounded-2xl border border-neutral-200 bg-white p-6 animate-pulse ${className}`}>
        <div className="h-5 bg-neutral-200 rounded w-48 mb-4" />
        <div className="h-24 bg-neutral-100 rounded-xl" />
      </div>
    );
  }

  return (
    <div className={`rounded-2xl border border-blue-200/80 bg-white shadow-sm overflow-hidden ${className}`}>
      <div className="px-5 py-4 border-b border-neutral-100 bg-blue-50/50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-100 flex items-center justify-center shrink-0">
            <Target className="text-blue-600" size={18} />
          </div>
          <div>
            <h2 className="font-semibold text-neutral-900">What should we apply for?</h2>
            <p className="text-xs text-neutral-600 mt-0.5">
              Tell our team the roles and application types you want — we match applications to this.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={handleSave}
          disabled={saving || saved}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 disabled:opacity-60 shrink-0"
        >
          {saved ? (
            <>
              <CheckCircle size={16} /> Saved
            </>
          ) : (
            <>
              <Save size={16} /> {saving ? "Saving…" : "Save targets"}
            </>
          )}
        </button>
      </div>

      <div className="p-5 space-y-5">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500 mb-2">
            Application types
          </p>
          <div className="flex flex-wrap gap-2">
            {APPLICATION_TYPES.map(({ id, label }) => {
              const active = prefs.application_types.includes(id);
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => toggleType(id)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                    active
                      ? "bg-blue-600 text-white border-blue-600"
                      : "bg-white text-neutral-700 border-neutral-200 hover:border-blue-300 hover:bg-blue-50"
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-neutral-600 mb-1.5">
              Target roles
            </label>
            <input
              value={rolesInput}
              onChange={(e) => {
                setRolesInput(e.target.value);
                setSaved(false);
              }}
              placeholder="Software Engineer, Data Analyst, PM…"
              className="w-full px-3 py-2.5 rounded-xl border border-neutral-200 text-sm focus:border-blue-500 outline-none"
            />
            <p className="text-[11px] text-neutral-400 mt-1">Comma-separated job titles</p>
          </div>
          <div>
            <label className="block text-xs font-semibold text-neutral-600 mb-1.5">
              Locations
            </label>
            <input
              value={locationsInput}
              onChange={(e) => {
                setLocationsInput(e.target.value);
                setSaved(false);
              }}
              placeholder="Remote, NYC, Bay Area, London…"
              className="w-full px-3 py-2.5 rounded-xl border border-neutral-200 text-sm focus:border-blue-500 outline-none"
            />
          </div>
        </div>

        <div>
          <p className="text-xs font-semibold text-neutral-600 mb-2">Work mode</p>
          <div className="flex flex-wrap gap-2">
            {["remote", "hybrid", "onsite"].map((mode) => {
              const active = prefs.work_mode.includes(mode);
              return (
                <button
                  key={mode}
                  type="button"
                  onClick={() => toggleWorkMode(mode)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border capitalize transition-colors ${
                    active
                      ? "bg-neutral-900 text-white border-neutral-900"
                      : "bg-white text-neutral-700 border-neutral-200 hover:bg-neutral-50"
                  }`}
                >
                  {mode}
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-neutral-600 mb-1.5">
            Notes for our team
          </label>
          <textarea
            value={prefs.additional_notes || ""}
            onChange={(e) => {
              setPrefs({ ...prefs, additional_notes: e.target.value });
              setSaved(false);
            }}
            rows={2}
            placeholder="e.g. Prefer backend roles, avoid crypto, open to relocation in Q3…"
            className="w-full px-3 py-2.5 rounded-xl border border-neutral-200 text-sm resize-none focus:border-blue-500 outline-none"
          />
        </div>

        {error && (
          <p className="text-sm text-red-700 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
            {error}
          </p>
        )}

        {prefs.application_types.length > 0 || rolesInput.trim() ? (
          <div className="rounded-xl bg-neutral-50 border border-neutral-100 px-3 py-2 text-xs text-neutral-600">
            <span className="font-medium text-neutral-800">Active targets: </span>
            {[
              ...prefs.application_types.map(
                (id) => APPLICATION_TYPES.find((t) => t.id === id)?.label || id,
              ),
              ...rolesInput
                .split(",")
                .map((s) => s.trim())
                .filter(Boolean)
                .slice(0, 3),
            ]
              .filter(Boolean)
              .join(" · ") || "None yet"}
          </div>
        ) : null}
      </div>
    </div>
  );
}
