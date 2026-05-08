"use client";
import React, { useEffect, useState } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { motion, AnimatePresence } from "motion/react";
import {
  Briefcase,
  MapPin,
  Calendar,
  Plus,
  Search,
  X,
  Building2,
  MoreHorizontal,
} from "lucide-react";

const STATUSES = [
  {
    id: "applied",
    label: "Applied",
    badge: "bg-blue-50 text-blue-700 border border-blue-200",
  },
  {
    id: "under_review",
    label: "Under Review",
    badge: "bg-yellow-50 text-yellow-700 border border-yellow-200",
  },
  {
    id: "interview",
    label: "Interview",
    badge: "bg-green-50 text-green-700 border border-green-200",
  },
  {
    id: "offer",
    label: "Offer",
    badge: "bg-purple-50 text-purple-700 border border-purple-200",
  },
  {
    id: "rejected",
    label: "Rejected",
    badge: "bg-red-50 text-red-600 border border-red-200",
  },
];

const getStatusBadge = (status) => {
  const s = STATUSES.find((x) => x.id === status);
  return s
    ? s.badge
    : "bg-neutral-100 text-neutral-600 border border-neutral-200";
};

const defaultForm = {
  company_name: "",
  job_title: "",
  job_location: "",
  status: "applied",
  application_url: "",
  notes: "",
};

export default function ApplicationsPage() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(defaultForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [activeMenu, setActiveMenu] = useState(null);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const res = await fetch("/api/applications");
      if (res.ok) setApplications(await res.json());
      else if (res.status === 401 && typeof window !== "undefined")
        window.location.href = "/account/signin";
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!form.company_name || !form.job_title) {
      setError("Company and job title are required.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        await fetchApplications();
        setShowModal(false);
        setForm(defaultForm);
      } else setError("Failed to save. Please try again.");
    } catch (e) {
      setError("Failed to save.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    await fetch(`/api/applications/${id}`, { method: "DELETE" });
    setApplications((prev) => prev.filter((a) => a.id !== id));
    setActiveMenu(null);
  };

  const handleStatusChange = async (id, newStatus) => {
    await fetch(`/api/applications/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    setApplications((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: newStatus } : a)),
    );
    setActiveMenu(null);
  };

  const filtered = applications.filter((a) => {
    const matchSearch =
      !search ||
      a.company_name.toLowerCase().includes(search.toLowerCase()) ||
      a.job_title.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === "all" || a.status === filterStatus;
    return matchSearch && matchStatus;
  });

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-6xl">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
          <div>
            <h1 className="text-2xl font-bold text-neutral-900">
              Applications
            </h1>
            <p className="text-neutral-500 text-sm mt-0.5">
              {applications.length} total tracked
            </p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium text-sm self-start"
          >
            <Plus size={18} /> Add Application
          </button>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400"
              size={17}
            />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search applications..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-neutral-200 focus:border-blue-500 outline-none text-sm"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto">
            <button
              onClick={() => setFilterStatus("all")}
              className={`px-3 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${filterStatus === "all" ? "bg-neutral-900 text-white" : "bg-white border border-neutral-200 text-neutral-600"}`}
            >
              All ({applications.length})
            </button>
            {STATUSES.map((s) => (
              <button
                key={s.id}
                onClick={() => setFilterStatus(s.id)}
                className={`px-3 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${filterStatus === s.id ? "bg-neutral-900 text-white" : "bg-white border border-neutral-200 text-neutral-600"}`}
              >
                {s.label} (
                {applications.filter((a) => a.status === s.id).length})
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-40 bg-neutral-200 rounded-2xl" />
            ))}
          </div>
        ) : filtered.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((app, i) => {
              const badgeClass = getStatusBadge(app.status);
              return (
                <motion.div
                  key={app.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="bg-white rounded-2xl border border-neutral-200 p-5 hover:shadow-md transition-shadow relative"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 min-w-0 pr-2">
                      <p className="font-semibold text-neutral-900 truncate">
                        {app.job_title}
                      </p>
                      <div className="flex items-center gap-1.5 mt-1 text-sm text-neutral-500">
                        <Building2 size={13} />
                        <span className="truncate">{app.company_name}</span>
                      </div>
                    </div>
                    <div className="relative">
                      <button
                        onClick={() =>
                          setActiveMenu(activeMenu === app.id ? null : app.id)
                        }
                        className="p-1.5 hover:bg-neutral-100 rounded-lg text-neutral-400"
                      >
                        <MoreHorizontal size={16} />
                      </button>
                      {activeMenu === app.id && (
                        <div className="absolute right-0 top-8 bg-white border border-neutral-200 rounded-xl shadow-xl z-20 py-1 w-40">
                          <p className="px-3 py-1.5 text-xs font-semibold text-neutral-400 uppercase">
                            Move to
                          </p>
                          {STATUSES.filter((s) => s.id !== app.status).map(
                            (s) => (
                              <button
                                key={s.id}
                                onClick={() => handleStatusChange(app.id, s.id)}
                                className="w-full text-left px-3 py-2 text-sm hover:bg-neutral-50 text-neutral-700"
                              >
                                {s.label}
                              </button>
                            ),
                          )}
                          <div className="border-t border-neutral-100 my-1" />
                          <button
                            onClick={() => handleDelete(app.id)}
                            className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                  {app.job_location && (
                    <div className="flex items-center gap-1.5 text-xs text-neutral-400 mb-1">
                      <MapPin size={11} />
                      <span>{app.job_location}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-neutral-100">
                    <span
                      className={`text-xs font-semibold px-2.5 py-1 rounded-lg capitalize ${badgeClass}`}
                    >
                      {app.status.replace("_", " ")}
                    </span>
                    <span className="text-xs text-neutral-400 flex items-center gap-1">
                      <Calendar size={11} />{" "}
                      {new Date(app.applied_date).toLocaleDateString()}
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-neutral-200 p-16 text-center">
            <Briefcase className="mx-auto text-neutral-300 mb-4" size={48} />
            <h3 className="text-lg font-semibold text-neutral-900 mb-2">
              No applications yet
            </h3>
            <p className="text-neutral-500 text-sm mb-6">
              Start tracking your job applications to stay organized.
            </p>
            <button
              onClick={() => setShowModal(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700"
            >
              <Plus size={18} /> Add First Application
            </button>
          </div>
        )}
      </div>

      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6 border-b border-neutral-100 flex items-center justify-between sticky top-0 bg-white rounded-t-2xl">
                <h2 className="text-xl font-bold text-neutral-900">
                  Add Application
                </h2>
                <button
                  onClick={() => {
                    setShowModal(false);
                    setError(null);
                    setForm(defaultForm);
                  }}
                  className="p-2 hover:bg-neutral-100 rounded-lg"
                >
                  <X size={20} />
                </button>
              </div>
              <div className="p-6 space-y-4">
                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-600">
                    {error}
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                    Job Title *
                  </label>
                  <input
                    value={form.job_title}
                    onChange={(e) =>
                      setForm({ ...form, job_title: e.target.value })
                    }
                    placeholder="e.g., Software Engineer"
                    className="w-full px-4 py-2.5 border border-neutral-200 rounded-xl focus:border-blue-500 outline-none text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                    Company *
                  </label>
                  <input
                    value={form.company_name}
                    onChange={(e) =>
                      setForm({ ...form, company_name: e.target.value })
                    }
                    placeholder="e.g., Google"
                    className="w-full px-4 py-2.5 border border-neutral-200 rounded-xl focus:border-blue-500 outline-none text-sm"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                      Location
                    </label>
                    <input
                      value={form.job_location}
                      onChange={(e) =>
                        setForm({ ...form, job_location: e.target.value })
                      }
                      placeholder="Remote"
                      className="w-full px-4 py-2.5 border border-neutral-200 rounded-xl focus:border-blue-500 outline-none text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                      Status
                    </label>
                    <select
                      value={form.status}
                      onChange={(e) =>
                        setForm({ ...form, status: e.target.value })
                      }
                      className="w-full px-4 py-2.5 border border-neutral-200 rounded-xl focus:border-blue-500 outline-none text-sm bg-white"
                    >
                      {STATUSES.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                    Job URL
                  </label>
                  <input
                    value={form.application_url}
                    onChange={(e) =>
                      setForm({ ...form, application_url: e.target.value })
                    }
                    placeholder="https://..."
                    className="w-full px-4 py-2.5 border border-neutral-200 rounded-xl focus:border-blue-500 outline-none text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                    Notes
                  </label>
                  <textarea
                    value={form.notes}
                    onChange={(e) =>
                      setForm({ ...form, notes: e.target.value })
                    }
                    rows={3}
                    placeholder="Any notes..."
                    className="w-full px-4 py-2.5 border border-neutral-200 rounded-xl focus:border-blue-500 outline-none resize-none text-sm"
                  />
                </div>
              </div>
              <div className="p-6 border-t border-neutral-100 flex gap-3">
                <button
                  onClick={() => {
                    setShowModal(false);
                    setError(null);
                    setForm(defaultForm);
                  }}
                  className="flex-1 py-2.5 border border-neutral-200 rounded-xl text-sm font-medium text-neutral-700 hover:bg-neutral-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex-1 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
                >
                  {saving ? "Saving..." : "Add Application"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      {activeMenu && (
        <div
          className="fixed inset-0 z-10"
          onClick={() => setActiveMenu(null)}
        />
      )}
    </DashboardLayout>
  );
}
