"use client";
import React, { useEffect, useState } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import Card, { CardHeader, CardContent } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input, { Textarea, Select } from "@/components/ui/Input";
import { motion } from "motion/react";
import { Save, CheckCircle } from "lucide-react";

export default function PreferencesPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [preferences, setPreferences] = useState({
    target_roles: [],
    preferred_locations: [],
    work_mode: [],
    min_salary: "",
    max_salary: "",
    currency: "USD",
    notice_period: "",
    preferred_industries: [],
    company_size: [],
    visa_sponsorship: false,
    willing_to_relocate: false,
    additional_notes: "",
  });

  useEffect(() => {
    fetchPreferences();
  }, []);

  const fetchPreferences = async () => {
    try {
      const response = await fetch("/api/preferences");
      if (response.ok) {
        const data = await response.json();
        if (data) {
          setPreferences(data);
        }
      } else if (response.status === 401 && typeof window !== "undefined") {
        window.location.href = "/account/signin";
      }
    } catch (error) {
      console.error("Error fetching preferences:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await fetch("/api/preferences", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(preferences),
      });
      if (response.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      }
    } catch (error) {
      console.error("Error saving preferences:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleArrayInput = (field, value) => {
    const array = value
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    setPreferences({ ...preferences, [field]: array });
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-neutral-200 rounded w-64" />
          <div className="h-96 bg-neutral-200 rounded-2xl" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-4xl">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-neutral-900">
              Job Preferences
            </h1>
            <p className="text-neutral-600 mt-1">
              Help us find the perfect roles for you
            </p>
          </div>
          <Button onClick={handleSave} loading={saving} disabled={saved}>
            {saved ? (
              <>
                <CheckCircle size={20} />
                Saved!
              </>
            ) : (
              <>
                <Save size={20} />
                Save Preferences
              </>
            )}
          </Button>
        </div>

        {/* Target Roles */}
        <Card>
          <CardHeader>
            <h2 className="text-xl font-bold">Target Roles</h2>
            <p className="text-sm text-neutral-600 mt-1">
              What positions are you looking for?
            </p>
          </CardHeader>
          <CardContent>
            <Input
              label="Target Roles (comma separated)"
              placeholder="e.g., Software Engineer, Full Stack Developer, Backend Engineer"
              value={preferences.target_roles.join(", ")}
              onChange={(e) => handleArrayInput("target_roles", e.target.value)}
            />
          </CardContent>
        </Card>

        {/* Location & Work Mode */}
        <Card>
          <CardHeader>
            <h2 className="text-xl font-bold">Location & Work Mode</h2>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              label="Preferred Locations (comma separated)"
              placeholder="e.g., San Francisco, New York, Remote"
              value={preferences.preferred_locations.join(", ")}
              onChange={(e) =>
                handleArrayInput("preferred_locations", e.target.value)
              }
            />

            <div>
              <label className="text-sm font-medium text-neutral-700 mb-2 block">
                Work Mode
              </label>
              <div className="flex flex-wrap gap-3">
                {["remote", "hybrid", "onsite"].map((mode) => (
                  <label
                    key={mode}
                    className="flex items-center gap-2 px-4 py-2 border border-neutral-300 rounded-lg cursor-pointer hover:bg-neutral-50"
                  >
                    <input
                      type="checkbox"
                      checked={preferences.work_mode.includes(mode)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setPreferences({
                            ...preferences,
                            work_mode: [...preferences.work_mode, mode],
                          });
                        } else {
                          setPreferences({
                            ...preferences,
                            work_mode: preferences.work_mode.filter(
                              (m) => m !== mode,
                            ),
                          });
                        }
                      }}
                      className="rounded"
                    />
                    <span className="capitalize">{mode}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={preferences.willing_to_relocate}
                  onChange={(e) =>
                    setPreferences({
                      ...preferences,
                      willing_to_relocate: e.target.checked,
                    })
                  }
                  className="rounded"
                />
                <span className="text-sm font-medium text-neutral-700">
                  Willing to relocate
                </span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={preferences.visa_sponsorship}
                  onChange={(e) =>
                    setPreferences({
                      ...preferences,
                      visa_sponsorship: e.target.checked,
                    })
                  }
                  className="rounded"
                />
                <span className="text-sm font-medium text-neutral-700">
                  Require visa sponsorship
                </span>
              </label>
            </div>
          </CardContent>
        </Card>

        {/* Compensation */}
        <Card>
          <CardHeader>
            <h2 className="text-xl font-bold">Compensation</h2>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <Input
                label="Min Salary"
                type="number"
                placeholder="80000"
                value={preferences.min_salary}
                onChange={(e) =>
                  setPreferences({ ...preferences, min_salary: e.target.value })
                }
              />
              <Input
                label="Max Salary"
                type="number"
                placeholder="150000"
                value={preferences.max_salary}
                onChange={(e) =>
                  setPreferences({ ...preferences, max_salary: e.target.value })
                }
              />
              <Select
                label="Currency"
                value={preferences.currency}
                onChange={(e) =>
                  setPreferences({ ...preferences, currency: e.target.value })
                }
                options={[
                  { value: "USD", label: "USD ($)" },
                  { value: "EUR", label: "EUR (€)" },
                  { value: "GBP", label: "GBP (£)" },
                  { value: "INR", label: "INR (₹)" },
                ]}
              />
            </div>

            <Select
              label="Notice Period"
              value={preferences.notice_period}
              onChange={(e) =>
                setPreferences({
                  ...preferences,
                  notice_period: e.target.value,
                })
              }
              options={[
                { value: "", label: "Select notice period" },
                { value: "immediate", label: "Immediate" },
                { value: "2_weeks", label: "2 weeks" },
                { value: "1_month", label: "1 month" },
                { value: "2_months", label: "2 months" },
                { value: "3_months", label: "3+ months" },
              ]}
            />
          </CardContent>
        </Card>

        {/* Company Preferences */}
        <Card>
          <CardHeader>
            <h2 className="text-xl font-bold">Company Preferences</h2>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              label="Preferred Industries (comma separated)"
              placeholder="e.g., Technology, Finance, Healthcare"
              value={preferences.preferred_industries.join(", ")}
              onChange={(e) =>
                handleArrayInput("preferred_industries", e.target.value)
              }
            />

            <div>
              <label className="text-sm font-medium text-neutral-700 mb-2 block">
                Company Size
              </label>
              <div className="flex flex-wrap gap-3">
                {["startup", "small", "medium", "large", "enterprise"].map(
                  (size) => (
                    <label
                      key={size}
                      className="flex items-center gap-2 px-4 py-2 border border-neutral-300 rounded-lg cursor-pointer hover:bg-neutral-50"
                    >
                      <input
                        type="checkbox"
                        checked={preferences.company_size.includes(size)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setPreferences({
                              ...preferences,
                              company_size: [...preferences.company_size, size],
                            });
                          } else {
                            setPreferences({
                              ...preferences,
                              company_size: preferences.company_size.filter(
                                (s) => s !== size,
                              ),
                            });
                          }
                        }}
                        className="rounded"
                      />
                      <span className="capitalize">{size}</span>
                    </label>
                  ),
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Additional Notes */}
        <Card>
          <CardHeader>
            <h2 className="text-xl font-bold">Additional Notes</h2>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="Any other preferences or requirements..."
              rows={4}
              value={preferences.additional_notes}
              onChange={(e) =>
                setPreferences({
                  ...preferences,
                  additional_notes: e.target.value,
                })
              }
            />
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button
            onClick={handleSave}
            loading={saving}
            disabled={saved}
            size="lg"
          >
            {saved ? (
              <>
                <CheckCircle size={20} />
                Saved Successfully!
              </>
            ) : (
              <>
                <Save size={20} />
                Save All Preferences
              </>
            )}
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
}
