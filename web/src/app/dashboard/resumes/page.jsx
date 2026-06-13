"use client";
import React, { useEffect, useState } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import Card, { CardContent } from "@/components/ui/Card";
import ResumeUploadZone from "@/components/ResumeUploadZone";
import ResumeInsightsPanel from "@/components/dashboard/ResumeInsightsPanel";
import { motion } from "motion/react";
import {
  FileText,
  Download,
  Trash2,
  Star,
  TrendingUp,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Pencil,
  Layers,
  RefreshCw,
} from "lucide-react";
import useUser from "@/utils/useUser";
import { getLocalResumes, setLocalResumes } from "@/utils/localResumes";
import { fetchWithAuth } from "@/utils/apiAuthHeaders";
import { gradeFromScore } from "@/utils/atsScore";

export default function ResumesPage() {
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);
  const [jobProfileLabel, setJobProfileLabel] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editLabel, setEditLabel] = useState("");
  const [insightsKey, setInsightsKey] = useState(0);
  const [rescanningId, setRescanningId] = useState(null);
  const { data: user, loading: authLoading } = useUser();

  useEffect(() => {
    if (authLoading) return;
    if (!user?.email) return;
    fetchResumes();
  }, [authLoading, user?.email, user?.id]);

  const fetchResumes = async () => {
    try {
      const response = await fetchWithAuth("/api/resumes");
      if (response.ok) {
        setResumes(await response.json());
      } else {
        setResumes(getLocalResumes(user?.id));
      }
    } catch {
      setResumes(getLocalResumes(user?.id));
    } finally {
      setLoading(false);
    }
  };

  const refreshAll = () => {
    void fetchResumes();
    setInsightsKey((k) => k + 1);
  };

  const handleUploadSuccess = ({ resume, resumes: localList }) => {
    if (localList) setResumes(localList);
    else if (resume) setResumes((prev) => [resume, ...prev]);
    if (resume?.id) setExpandedId(resume.id);
    setJobProfileLabel("");
    refreshAll();
  };

  const handleDelete = async (id) => {
    try {
      const response = await fetchWithAuth(`/api/resumes/${id}`, {
        method: "DELETE",
      });
      if (response.ok) {
        setResumes((prev) => prev.filter((r) => r.id !== id));
      } else {
        const next = resumes.filter((r) => r.id !== id);
        setResumes(next);
        setLocalResumes(user?.id, next);
      }
    } catch {
      const next = resumes.filter((r) => r.id !== id);
      setResumes(next);
      setLocalResumes(user?.id, next);
    }
    refreshAll();
  };

  const handleSetPrimary = async (id) => {
    try {
      const response = await fetchWithAuth(`/api/resumes/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_primary: true }),
      });
      if (response.ok) {
        await fetchResumes();
      } else {
        const next = resumes.map((r) => ({ ...r, is_primary: r.id === id }));
        setResumes(next);
        setLocalResumes(user?.id, next);
      }
    } catch {
      const next = resumes.map((r) => ({ ...r, is_primary: r.id === id }));
      setResumes(next);
      setLocalResumes(user?.id, next);
    }
    refreshAll();
  };

  const saveLabel = async (id) => {
    try {
      const response = await fetchWithAuth(`/api/resumes/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ job_profile_label: editLabel }),
      });
      if (response.ok) {
        const updated = await response.json();
        setResumes((prev) =>
          prev.map((r) => (r.id === id ? { ...r, ...updated } : r)),
        );
      } else {
        setResumes((prev) =>
          prev.map((r) =>
            r.id === id ? { ...r, job_profile_label: editLabel.trim() || null } : r,
          ),
        );
      }
    } catch {
      setResumes((prev) =>
        prev.map((r) =>
          r.id === id ? { ...r, job_profile_label: editLabel.trim() || null } : r,
        ),
      );
    }
    setEditingId(null);
    setEditLabel("");
    refreshAll();
  };

  const handleRescanAts = async (id) => {
    setRescanningId(id);
    try {
      const response = await fetchWithAuth(`/api/resumes/${id}/reanalyze`, {
        method: "POST",
      });
      if (response.ok) {
        const data = await response.json();
        if (data.resume) {
          setResumes((prev) =>
            prev.map((r) => (r.id === id ? { ...r, ...data.resume } : r)),
          );
          setExpandedId(id);
        }
      }
    } catch {
      // keep existing score on failure
    } finally {
      setRescanningId(null);
      refreshAll();
    }
  };

  const getATSScoreClass = (score) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const avgAts =
    resumes.length > 0
      ? Math.round(
          resumes.reduce((acc, r) => acc + (r.ats_score || 0), 0) / resumes.length,
        )
      : 0;

  const profileCount = new Set(
    resumes.map((r) => r.job_profile_label?.trim()).filter(Boolean),
  ).size;

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900">Resumes</h1>
          <p className="text-neutral-600 mt-1">
            Upload a tailored resume for each job profile — with real ATS insights
          </p>
        </div>

        <ResumeInsightsPanel key={insightsKey} />

        <Card>
          <CardContent className="p-6 sm:p-8">
            <h2 className="text-lg font-semibold text-neutral-900 mb-1 flex items-center gap-2">
              <Layers size={18} className="text-blue-600" />
              Add resume variant
            </h2>
            <p className="text-sm text-neutral-500 mb-5">
              Use a different file per role focus (e.g. one for engineering, one for management).
            </p>
            <ResumeUploadZone
              variant="dashboard"
              userId={user?.id}
              existingCount={resumes.length}
              jobProfileLabel={jobProfileLabel}
              onJobProfileLabelChange={setJobProfileLabel}
              onSuccess={handleUploadSuccess}
            />
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-5">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 bg-green-100 rounded-xl flex items-center justify-center">
                  <CheckCircle2 className="text-green-600" size={22} />
                </div>
                <div>
                  <p className="text-xs text-neutral-600">Average ATS Score</p>
                  <p className="text-2xl font-bold text-neutral-900">{avgAts}%</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 bg-blue-100 rounded-xl flex items-center justify-center">
                  <FileText className="text-blue-600" size={22} />
                </div>
                <div>
                  <p className="text-xs text-neutral-600">Resume files</p>
                  <p className="text-2xl font-bold text-neutral-900">{resumes.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 bg-purple-100 rounded-xl flex items-center justify-center">
                  <TrendingUp className="text-purple-600" size={22} />
                </div>
                <div>
                  <p className="text-xs text-neutral-600">Job profiles</p>
                  <p className="text-2xl font-bold text-neutral-900">
                    {profileCount || (resumes.length ? "—" : 0)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          {resumes.map((resume, index) => (
            <motion.div
              key={resume.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card hover>
                <CardContent className="p-5 sm:p-6">
                  <div className="flex flex-col lg:flex-row lg:items-center gap-4 justify-between">
                    <div className="flex items-start gap-4 flex-1 min-w-0">
                      <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center shrink-0">
                        <FileText className="text-blue-600" size={22} />
                      </div>
                      <div className="flex-1 min-w-0">
                        {editingId === resume.id ? (
                          <div className="flex flex-wrap items-center gap-2 mb-2">
                            <input
                              value={editLabel}
                              onChange={(e) => setEditLabel(e.target.value)}
                              placeholder="Job profile label"
                              className="flex-1 min-w-[180px] px-3 py-1.5 rounded-lg border border-neutral-200 text-sm"
                              autoFocus
                            />
                            <button
                              type="button"
                              onClick={() => saveLabel(resume.id)}
                              className="px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-semibold"
                            >
                              Save
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setEditingId(null);
                                setEditLabel("");
                              }}
                              className="px-3 py-1.5 rounded-lg border border-neutral-200 text-xs"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <div className="flex flex-wrap items-center gap-2 mb-1">
                            <h3 className="font-semibold text-neutral-900 truncate">
                              {resume.job_profile_label || resume.file_name}
                            </h3>
                            {resume.job_profile_label && (
                              <span className="text-xs text-neutral-400 truncate max-w-[200px]">
                                ({resume.file_name})
                              </span>
                            )}
                            {resume.is_primary && (
                              <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-medium rounded-lg inline-flex items-center gap-1">
                                <Star size={11} />
                                Primary
                              </span>
                            )}
                            <button
                              type="button"
                              onClick={() => {
                                setEditingId(resume.id);
                                setEditLabel(resume.job_profile_label || "");
                              }}
                              className="p-1 text-neutral-400 hover:text-blue-600"
                              title="Edit job profile label"
                            >
                              <Pencil size={14} />
                            </button>
                          </div>
                        )}
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-neutral-500">
                          <span>
                            Uploaded {new Date(resume.created_at).toLocaleDateString()}
                          </span>
                          {resume.file_size ? (
                            <>
                              <span>•</span>
                              <span>{(resume.file_size / 1024).toFixed(0)} KB</span>
                            </>
                          ) : null}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 shrink-0">
                      <div className="text-center">
                        <div
                          className={`text-2xl sm:text-3xl font-bold ${getATSScoreClass(resume.ats_score)}`}
                        >
                          {resume.ats_score ?? "—"}%
                        </div>
                        <p className="text-[11px] text-neutral-500 mt-0.5">
                          {resume.ats_grade || gradeFromScore(resume.ats_score)}
                        </p>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleRescanAts(resume.id)}
                          disabled={rescanningId === resume.id}
                          className="p-2 hover:bg-blue-50 rounded-lg text-neutral-500 hover:text-blue-600 disabled:opacity-50"
                          title="Re-scan ATS score from resume content"
                        >
                          <RefreshCw
                            size={18}
                            className={rescanningId === resume.id ? "animate-spin" : ""}
                          />
                        </button>
                        {!resume.is_primary && (
                          <button
                            type="button"
                            onClick={() => handleSetPrimary(resume.id)}
                            className="p-2 hover:bg-blue-50 rounded-lg text-neutral-500 hover:text-blue-600"
                            title="Set as primary"
                          >
                            <Star size={18} />
                          </button>
                        )}
                        <a
                          href={resume.file_url}
                          download
                          className="p-2 hover:bg-neutral-100 rounded-lg text-neutral-500 hover:text-neutral-900"
                        >
                          <Download size={18} />
                        </a>
                        <button
                          type="button"
                          onClick={() => handleDelete(resume.id)}
                          className="p-2 hover:bg-red-50 rounded-lg text-neutral-500 hover:text-red-600"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  </div>

                  {Array.isArray(resume.ats_feedback) && resume.ats_feedback.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-neutral-100">
                      <button
                        type="button"
                        onClick={() =>
                          setExpandedId(expandedId === resume.id ? null : resume.id)
                        }
                        className="flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-700"
                      >
                        {expandedId === resume.id ? (
                          <>
                            <ChevronUp size={16} />
                            Hide ATS feedback
                          </>
                        ) : (
                          <>
                            <ChevronDown size={16} />
                            View ATS feedback ({resume.ats_feedback.length})
                          </>
                        )}
                      </button>
                      {expandedId === resume.id && (
                        <ul className="mt-3 space-y-2">
                          {resume.ats_feedback.map((item, i) => (
                            <li
                              key={i}
                              className={`text-xs leading-relaxed rounded-lg px-3 py-2 border ${
                                item.type === "ok"
                                  ? "bg-emerald-50 border-emerald-100 text-emerald-900"
                                  : item.type === "warn" || item.type === "error"
                                    ? "bg-amber-50 border-amber-100 text-amber-900"
                                    : "bg-neutral-50 border-neutral-100 text-neutral-700"
                              }`}
                            >
                              {item.text}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ))}

          {resumes.length === 0 && !loading && (
            <Card>
              <CardContent className="p-12 text-center">
                <FileText className="mx-auto text-neutral-300 mb-4" size={48} />
                <h3 className="text-lg font-semibold text-neutral-900 mb-2">
                  No resumes yet
                </h3>
                <p className="text-neutral-600 text-sm max-w-md mx-auto">
                  Upload your first resume above. Add more variants for different job
                  profiles — each gets its own ATS score and insights.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
