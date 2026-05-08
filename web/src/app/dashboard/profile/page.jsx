"use client";
import React, { useEffect, useState } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { motion } from "motion/react";
import {
  User,
  Save,
  CheckCircle,
  Camera,
  Linkedin,
  Github,
  Globe,
  MapPin,
  Briefcase,
  Building2,
} from "lucide-react";
import useUser from "@/utils/useUser";
import useUpload from "@/utils/useUpload";

export default function ProfilePage() {
  const { data: authUser } = useUser();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [upload, { loading: uploading }] = useUpload();
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await fetch("/api/users/profile");
      if (res.ok) {
        setProfile(await res.json());
      } else if (res.status === 401) {
        window.location.href = "/account/signin";
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/users/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profile),
      });
      if (res.ok) {
        setProfile(await res.json());
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      } else {
        setError("Failed to save profile.");
      }
    } catch (e) {
      setError("Failed to save.");
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const { url } = await upload({ file });
    if (url) setProfile({ ...profile, profile_image: url });
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="max-w-3xl space-y-4">
          <div className="h-8 bg-neutral-200 rounded w-48" />
          <div className="h-64 bg-neutral-200 rounded-2xl" />
        </div>
      </DashboardLayout>
    );
  }

  const inputClass =
    "w-full px-4 py-2.5 border border-neutral-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none text-sm transition-all";

  return (
    <DashboardLayout>
      <div className="max-w-3xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-neutral-900">Profile</h1>
            <p className="text-neutral-500 text-sm mt-0.5">
              Manage your personal information
            </p>
          </div>
          <button
            onClick={handleSave}
            disabled={saving || saved}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-sm transition-all ${
              saved
                ? "bg-green-50 text-green-700 border border-green-200"
                : "bg-blue-600 text-white hover:bg-blue-700"
            } disabled:opacity-50`}
          >
            {saved ? (
              <>
                <CheckCircle size={16} /> Saved!
              </>
            ) : (
              <>
                <Save size={16} /> {saving ? "Saving..." : "Save Changes"}
              </>
            )}
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        {/* Avatar */}
        <div className="bg-white rounded-2xl border border-neutral-200 p-6">
          <h2 className="font-semibold text-neutral-900 mb-4">Profile Photo</h2>
          <div className="flex items-center gap-5">
            <div className="relative flex-shrink-0">
              {profile?.profile_image ? (
                <img
                  src={profile.profile_image}
                  alt="Avatar"
                  className="w-20 h-20 rounded-2xl object-cover"
                />
              ) : (
                <div className="w-20 h-20 bg-gradient-to-tr from-blue-600 to-green-400 rounded-2xl flex items-center justify-center text-white text-2xl font-bold">
                  {authUser?.name?.slice(0, 2).toUpperCase() || "U"}
                </div>
              )}
              <label className="absolute -bottom-1 -right-1 w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center cursor-pointer hover:bg-blue-700 transition-colors">
                <Camera size={14} className="text-white" />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  className="hidden"
                />
              </label>
            </div>
            <div>
              <p className="font-medium text-neutral-900">
                {profile?.full_name || authUser?.name || "Your Name"}
              </p>
              <p className="text-sm text-neutral-500">{authUser?.email}</p>
              {uploading && (
                <p className="text-xs text-blue-600 mt-1">Uploading...</p>
              )}
            </div>
          </div>
        </div>

        {/* Basic Info */}
        <div className="bg-white rounded-2xl border border-neutral-200 p-6">
          <h2 className="font-semibold text-neutral-900 mb-4">
            Basic Information
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-neutral-500 mb-1.5 uppercase tracking-wider">
                Full Name
              </label>
              <input
                value={profile?.full_name || ""}
                onChange={(e) =>
                  setProfile({ ...profile, full_name: e.target.value })
                }
                placeholder="John Smith"
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-neutral-500 mb-1.5 uppercase tracking-wider">
                Phone
              </label>
              <input
                value={profile?.phone || ""}
                onChange={(e) =>
                  setProfile({ ...profile, phone: e.target.value })
                }
                placeholder="+1 (555) 000-0000"
                className={inputClass}
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-neutral-500 mb-1.5 uppercase tracking-wider">
                <span className="flex items-center gap-1.5">
                  <MapPin size={12} /> Location
                </span>
              </label>
              <input
                value={profile?.location || ""}
                onChange={(e) =>
                  setProfile({ ...profile, location: e.target.value })
                }
                placeholder="San Francisco, CA"
                className={inputClass}
              />
            </div>
          </div>
        </div>

        {/* Professional Info */}
        <div className="bg-white rounded-2xl border border-neutral-200 p-6">
          <h2 className="font-semibold text-neutral-900 mb-4">
            Professional Details
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-neutral-500 mb-1.5 uppercase tracking-wider">
                <span className="flex items-center gap-1.5">
                  <Briefcase size={12} /> Current Title
                </span>
              </label>
              <input
                value={profile?.current_title || ""}
                onChange={(e) =>
                  setProfile({ ...profile, current_title: e.target.value })
                }
                placeholder="Software Engineer"
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-neutral-500 mb-1.5 uppercase tracking-wider">
                <span className="flex items-center gap-1.5">
                  <Building2 size={12} /> Current Company
                </span>
              </label>
              <input
                value={profile?.current_company || ""}
                onChange={(e) =>
                  setProfile({ ...profile, current_company: e.target.value })
                }
                placeholder="Acme Corp"
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-neutral-500 mb-1.5 uppercase tracking-wider">
                Years of Experience
              </label>
              <input
                type="number"
                value={profile?.years_of_experience || ""}
                onChange={(e) =>
                  setProfile({
                    ...profile,
                    years_of_experience: parseInt(e.target.value),
                  })
                }
                placeholder="5"
                className={inputClass}
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-neutral-500 mb-1.5 uppercase tracking-wider">
                Bio
              </label>
              <textarea
                value={profile?.bio || ""}
                onChange={(e) =>
                  setProfile({ ...profile, bio: e.target.value })
                }
                rows={3}
                placeholder="Tell us about yourself and your career goals..."
                className="w-full px-4 py-2.5 border border-neutral-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none text-sm resize-none transition-all"
              />
            </div>
          </div>
        </div>

        {/* Links */}
        <div className="bg-white rounded-2xl border border-neutral-200 p-6">
          <h2 className="font-semibold text-neutral-900 mb-4">
            Online Presence
          </h2>
          <div className="space-y-3">
            {[
              {
                key: "linkedin_url",
                icon: Linkedin,
                placeholder: "https://linkedin.com/in/yourname",
                label: "LinkedIn",
              },
              {
                key: "github_url",
                icon: Github,
                placeholder: "https://github.com/yourname",
                label: "GitHub",
              },
              {
                key: "portfolio_url",
                icon: Globe,
                placeholder: "https://yourportfolio.com",
                label: "Portfolio",
              },
            ].map(({ key, icon: Icon, placeholder, label }) => (
              <div key={key} className="flex items-center gap-3">
                <div className="w-9 h-9 bg-neutral-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Icon size={16} className="text-neutral-500" />
                </div>
                <input
                  value={profile?.[key] || ""}
                  onChange={(e) =>
                    setProfile({ ...profile, [key]: e.target.value })
                  }
                  placeholder={placeholder}
                  className={inputClass}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Save bottom */}
        <div className="flex justify-end pb-4">
          <button
            onClick={handleSave}
            disabled={saving || saved}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium text-sm transition-all ${
              saved
                ? "bg-green-50 text-green-700 border border-green-200"
                : "bg-blue-600 text-white hover:bg-blue-700"
            } disabled:opacity-50`}
          >
            {saved ? (
              <>
                <CheckCircle size={16} /> Saved!
              </>
            ) : (
              <>
                <Save size={16} /> {saving ? "Saving..." : "Save Profile"}
              </>
            )}
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
}
