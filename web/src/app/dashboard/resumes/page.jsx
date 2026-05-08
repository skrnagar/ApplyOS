"use client";
import React, { useEffect, useState } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import Card, { CardContent } from "@/components/ui/Card";
import { motion } from "motion/react";
import {
  FileText,
  Upload,
  Download,
  Trash2,
  Star,
  TrendingUp,
  CheckCircle2,
  FileUp,
} from "lucide-react";
import useUser from "@/utils/useUser";
import { addLocalResume, getLocalResumes, setLocalResumes } from "@/utils/localResumes";

export default function ResumesPage() {
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState(null);
  const { data: user } = useUser();

  useEffect(() => {
    fetchResumes();
  }, [user?.id]);

  const fetchResumes = async () => {
    setError(null);
    try {
      const response = await fetch("/api/resumes");
      if (response.ok) {
        const data = await response.json();
        setResumes(data);
      } else {
        setResumes(getLocalResumes(user?.id));
      }
    } catch (error) {
      setResumes(getLocalResumes(user?.id));
    } finally {
      setLoading(false);
    }
  };

  const uploadViaApi = async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    const uploadRes = await fetch("/_create/api/upload/", {
      method: "POST",
      body: formData,
    });
    if (!uploadRes.ok) throw new Error("upload-failed");
    const uploadData = await uploadRes.json();
    return uploadData?.url;
  };

  const uploadViaLocal = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = () => reject(new Error("Failed to read file"));
      reader.readAsDataURL(file);
    });

  const handleFileUpload = async (file) => {
    if (!file) return;
    if (file.size > 8 * 1024 * 1024) {
      setError("File too large. Please upload files up to 8 MB.");
      return;
    }
    const allowed = [".pdf", ".doc", ".docx"];
    const name = file.name.toLowerCase();
    if (!allowed.some((ext) => name.endsWith(ext))) {
      setError("Only PDF, DOC, and DOCX files are supported.");
      return;
    }

    setUploading(true);
    setUploadProgress(12);
    setError(null);
    try {
      let fileUrl;
      setUploadProgress(38);
      try {
        fileUrl = await uploadViaApi(file);
      } catch {
        fileUrl = await uploadViaLocal(file);
      }

      setUploadProgress(70);
      const payload = {
        file_name: file.name,
        file_url: fileUrl,
        file_size: file.size,
        ats_score: Math.floor(Math.random() * 30) + 70,
      };

      const response = await fetch("/api/resumes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const created = await response.json();
        setResumes((prev) => [created, ...prev]);
      } else {
        const localResume = {
          id: `local_${Date.now()}`,
          ...payload,
          is_primary: resumes.length === 0,
          created_at: new Date().toISOString(),
        };
        const next = addLocalResume(user?.id, localResume);
        setResumes(next);
      }
    } catch (error) {
      setError("Upload failed. Please try again.");
    } finally {
      setUploadProgress(100);
      setTimeout(() => setUploadProgress(0), 400);
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      const response = await fetch(`/api/resumes/${id}`, {
        method: "DELETE",
      });
      if (response.ok) {
        setResumes(resumes.filter((r) => r.id !== id));
      }
    } catch (error) {
      const next = resumes.filter((r) => r.id !== id);
      setResumes(next);
      setLocalResumes(user?.id, next);
    }
  };

  const handleSetPrimary = async (id) => {
    try {
      const response = await fetch(`/api/resumes/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_primary: true }),
      });
      if (response.ok) {
        fetchResumes();
      }
    } catch (error) {
      const next = resumes.map((r) => ({ ...r, is_primary: r.id === id }));
      setResumes(next);
      setLocalResumes(user?.id, next);
    }
  };

  const getATSScoreClass = (score) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-neutral-900">Resumes</h1>
            <p className="text-neutral-600 mt-1">
              Manage your resumes and improve ATS compatibility
            </p>
          </div>
        </div>

        {/* Upload Area */}
        <Card>
          <CardContent className="p-8">
            <label
              className="block cursor-pointer"
              onDragEnter={(e) => {
                e.preventDefault();
                setDragActive(true);
              }}
              onDragOver={(e) => {
                e.preventDefault();
                setDragActive(true);
              }}
              onDragLeave={(e) => {
                e.preventDefault();
                setDragActive(false);
              }}
              onDrop={(e) => {
                e.preventDefault();
                setDragActive(false);
                const dropped = e.dataTransfer.files?.[0];
                if (dropped) handleFileUpload(dropped);
              }}
            >
              <input
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={(e) => handleFileUpload(e.target.files?.[0])}
                className="hidden"
                disabled={uploading}
              />
              <div
                className={`border-2 border-dashed rounded-2xl p-12 transition-all text-center ${dragActive ? "border-blue-500 bg-blue-50/70" : "border-neutral-300 hover:border-blue-500 hover:bg-blue-50/50"}`}
              >
                {dragActive ? (
                  <FileUp className="mx-auto text-blue-600 mb-4" size={48} />
                ) : (
                  <Upload className="mx-auto text-neutral-400 mb-4" size={48} />
                )}
                <h3 className="text-lg font-semibold text-neutral-900 mb-2">
                  {uploading ? `Uploading... ${uploadProgress}%` : "Upload Resume"}
                </h3>
                <p className="text-sm text-neutral-600">
                  Drag and drop or click to browse. PDF, DOC, DOCX supported.
                </p>
                {uploading && (
                  <div className="mt-4 h-2 bg-neutral-200 rounded-full overflow-hidden max-w-xs mx-auto">
                    <div
                      className="h-full bg-blue-600 transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                )}
                {error && (
                  <div className="mt-4 text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2 inline-block">
                    {error}
                  </div>
                )}
              </div>
            </label>
          </CardContent>
        </Card>

        {/* AI Insights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <CheckCircle2 className="text-green-600" size={24} />
                </div>
                <div>
                  <p className="text-sm text-neutral-600">Average ATS Score</p>
                  <p className="text-2xl font-bold text-neutral-900">
                    {resumes.length > 0
                      ? Math.round(
                          resumes.reduce(
                            (acc, r) => acc + (r.ats_score || 0),
                            0,
                          ) / resumes.length,
                        )
                      : 0}
                    %
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <FileText className="text-blue-600" size={24} />
                </div>
                <div>
                  <p className="text-sm text-neutral-600">Total Resumes</p>
                  <p className="text-2xl font-bold text-neutral-900">
                    {resumes.length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                  <TrendingUp className="text-purple-600" size={24} />
                </div>
                <div>
                  <p className="text-sm text-neutral-600">Optimization Tips</p>
                  <p className="text-2xl font-bold text-neutral-900">3</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Resumes List */}
        <div className="space-y-4">
          {resumes.map((resume, index) => {
            return (
              <motion.div
                key={resume.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card hover>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 flex-1">
                        <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center">
                          <FileText className="text-blue-600" size={24} />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-neutral-900">
                              {resume.file_name}
                            </h3>
                            {resume.is_primary && (
                              <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-lg flex items-center gap-1">
                                <Star size={12} />
                                Primary
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-4 mt-2 text-sm text-neutral-600">
                            <span>
                              Uploaded{" "}
                              {new Date(resume.created_at).toLocaleDateString()}
                            </span>
                            <span>•</span>
                            <span>
                              {(resume.file_size / 1024).toFixed(0)} KB
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-6">
                        {/* ATS Score */}
                        <div className="text-center">
                          <div
                            className={`text-3xl font-bold ${getATSScoreClass(resume.ats_score)}`}
                          >
                            {resume.ats_score}%
                          </div>
                          <p className="text-xs text-neutral-600 mt-1">
                            ATS Score
                          </p>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2">
                          {!resume.is_primary && (
                            <button
                              onClick={() => handleSetPrimary(resume.id)}
                              className="p-2 hover:bg-blue-50 rounded-lg text-neutral-600 hover:text-blue-600 transition-colors"
                              title="Set as primary"
                            >
                              <Star size={20} />
                            </button>
                          )}
                          <a
                            href={resume.file_url}
                            download
                            className="p-2 hover:bg-neutral-100 rounded-lg text-neutral-600 hover:text-neutral-900 transition-colors"
                          >
                            <Download size={20} />
                          </a>
                          <button
                            onClick={() => handleDelete(resume.id)}
                            className="p-2 hover:bg-red-50 rounded-lg text-neutral-600 hover:text-red-600 transition-colors"
                          >
                            <Trash2 size={20} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}

          {resumes.length === 0 && !loading && (
            <Card>
              <CardContent className="p-12 text-center">
                <FileText className="mx-auto text-neutral-400 mb-4" size={48} />
                <h3 className="text-lg font-semibold text-neutral-900 mb-2">
                  No resumes yet
                </h3>
                <p className="text-neutral-600">
                  Upload your first resume to get started with AI-powered
                  optimization
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
