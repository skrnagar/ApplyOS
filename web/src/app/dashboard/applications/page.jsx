"use client";
import React, { useEffect, useMemo, useState } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { motion } from "motion/react";
import {
  Briefcase,
  MapPin,
  Calendar,
  Search,
  Building2,
  Users,
  ExternalLink,
} from "lucide-react";
import { fetchWithAuth } from "@/utils/apiAuthHeaders";
import useUser from "@/utils/useUser";

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

export default function ApplicationsPage() {
  const { data: authUser, loading: authLoading } = useUser();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  useEffect(() => {
    if (authLoading) return;
    if (!authUser?.email) return;
    fetchApplications();
  }, [authLoading, authUser?.email]);

  const fetchApplications = async () => {
    try {
      const res = await fetchWithAuth("/api/applications");
      if (res.ok) setApplications(await res.json());
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const filtered = applications.filter((a) => {
    const matchSearch =
      !search ||
      a.company_name.toLowerCase().includes(search.toLowerCase()) ||
      a.job_title.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === "all" || a.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const statusCounts = useMemo(() => {
    const counts = { all: applications.length };
    for (const s of STATUSES) {
      counts[s.id] = applications.filter((a) => a.status === s.id).length;
    }
    return counts;
  }, [applications]);

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-6xl">
        <div className="flex flex-col sm:flex-row sm:items-start gap-4 justify-between">
          <div>
            <h1 className="text-2xl font-bold text-neutral-900">
              Applications
            </h1>
            <p className="text-neutral-500 text-sm mt-0.5">
              {applications.length} submitted by our team on your behalf
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-emerald-200 bg-emerald-50/80 px-4 py-3 flex gap-3 items-start">
          <Users className="text-emerald-700 shrink-0 mt-0.5" size={18} />
          <div className="text-sm text-emerald-900">
            <p className="font-semibold">We apply for you</p>
            <p className="text-emerald-800/90 mt-0.5 leading-relaxed">
              Our team submits applications to roles that match your preferences.
              Status updates appear here as we hear back from employers.
            </p>
          </div>
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
              placeholder="Search by company or role..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-neutral-200 focus:border-blue-500 outline-none text-sm"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto">
            <button
              type="button"
              onClick={() => setFilterStatus("all")}
              className={`px-3 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${filterStatus === "all" ? "bg-neutral-900 text-white" : "bg-white border border-neutral-200 text-neutral-600"}`}
            >
              All ({statusCounts.all})
            </button>
            {STATUSES.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => setFilterStatus(s.id)}
                className={`px-3 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${filterStatus === s.id ? "bg-neutral-900 text-white" : "bg-white border border-neutral-200 text-neutral-600"}`}
              >
                {s.label} ({statusCounts[s.id]})
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-40 bg-neutral-200 rounded-2xl animate-pulse" />
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
                  className="bg-white rounded-2xl border border-neutral-200 p-5 hover:shadow-md transition-shadow"
                >
                  <div className="mb-3">
                    <p className="font-semibold text-neutral-900 truncate">
                      {app.job_title}
                    </p>
                    <div className="flex items-center gap-1.5 mt-1 text-sm text-neutral-500">
                      <Building2 size={13} />
                      <span className="truncate">{app.company_name}</span>
                    </div>
                  </div>

                  {app.job_location && (
                    <div className="flex items-center gap-1.5 text-xs text-neutral-400 mb-1">
                      <MapPin size={11} />
                      <span>{app.job_location}</span>
                    </div>
                  )}

                  {app.notes && (
                    <p className="text-xs text-neutral-600 mt-2 line-clamp-2 leading-relaxed">
                      {app.notes}
                    </p>
                  )}

                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-neutral-100">
                    <span
                      className={`text-xs font-semibold px-2.5 py-1 rounded-lg capitalize ${badgeClass}`}
                    >
                      {app.status.replace("_", " ")}
                    </span>
                    <span className="text-xs text-neutral-400 flex items-center gap-1">
                      <Calendar size={11} />
                      {new Date(app.applied_date || app.created_at).toLocaleDateString()}
                    </span>
                  </div>

                  {app.application_url && (
                    <a
                      href={app.application_url}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-700"
                    >
                      View posting <ExternalLink size={12} />
                    </a>
                  )}
                </motion.div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-neutral-200 p-16 text-center">
            <Briefcase className="mx-auto text-neutral-300 mb-4" size={48} />
            <h3 className="text-lg font-semibold text-neutral-900 mb-2">
              No applications logged yet
            </h3>
            <p className="text-neutral-500 text-sm max-w-md mx-auto leading-relaxed">
              Once our team starts applying on your behalf, every role and status
              update will show up here automatically.
            </p>
            <a
              href="/dashboard/messages"
              className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 text-sm"
            >
              Message your assistant
            </a>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
