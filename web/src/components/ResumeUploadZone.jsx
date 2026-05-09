"use client";
import React, { useCallback, useId, useState } from "react";
import { FileText, FileUp, Upload } from "lucide-react";
import {
  getResumeFileUrlWithFallback,
  RESUME_ACCEPT,
  saveResumeRecord,
  validateResumeFile,
} from "@/utils/resumeUpload";

/**
 * Shared resume upload: drag-drop, browse, validation, API + local fallback.
 * @param {"marketing" | "dashboard"} variant
 */
export default function ResumeUploadZone({
  variant = "dashboard",
  userId,
  existingCount = 0,
  disabled = false,
  onSuccess,
  className = "",
}) {
  const inputId = useId();
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);

  const runUpload = useCallback(
    async (file) => {
      const v = validateResumeFile(file);
      if (!v.ok) {
        setError(v.error);
        return;
      }

      setUploading(true);
      setError(null);
      setProgress(10);
      try {
        setProgress(35);
        const fileUrl = await getResumeFileUrlWithFallback(file);
        setProgress(72);
        const { resume, resumes, source } = await saveResumeRecord(
          file,
          fileUrl,
          userId,
          existingCount,
        );
        setProgress(100);
        onSuccess?.({ resume, resumes, source });
      } catch {
        setError("Upload failed. Please try again.");
      } finally {
        setTimeout(() => setProgress(0), 500);
        setUploading(false);
      }
    },
    [userId, existingCount, onSuccess],
  );

  const onInputChange = (e) => {
    const f = e.target.files?.[0];
    e.target.value = "";
    if (f) runUpload(f);
  };

  const onDrop = (e) => {
    e.preventDefault();
    setDragActive(false);
    const f = e.dataTransfer.files?.[0];
    if (f) runUpload(f);
  };

  const isMarketing = variant === "marketing";

  const shell = isMarketing
    ? `rounded-2xl border-2 border-dashed transition-all flex flex-col items-center justify-center gap-4 bg-white/[0.02] ${
        dragActive
          ? "border-emerald-400/50 bg-emerald-500/10 shadow-[0_0_40px_rgba(52,211,153,0.15)]"
          : "border-white/10 hover:border-white/20"
      }`
    : `border-2 border-dashed rounded-2xl p-12 transition-all text-center ${
        dragActive
          ? "border-blue-500 bg-blue-50/70"
          : "border-neutral-300 hover:border-blue-500 hover:bg-blue-50/50"
      }`;

  return (
    <div className={className}>
      <label
        htmlFor={inputId}
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
        onDrop={onDrop}
      >
        <input
          id={inputId}
          type="file"
          accept={RESUME_ACCEPT}
          onChange={onInputChange}
          className="sr-only"
          disabled={disabled || uploading}
        />
        <div className={isMarketing ? `${shell} p-10` : shell}>
          {dragActive ? (
            <FileUp
              className={
                isMarketing
                  ? "text-emerald-400"
                  : "mx-auto text-blue-600 mb-4"
              }
              size={isMarketing ? 40 : 48}
            />
          ) : isMarketing ? (
            <FileText size={40} className="text-neutral-500" />
          ) : (
            <Upload className="mx-auto text-neutral-400 mb-4" size={48} />
          )}

          <div className="text-sm font-medium text-center">
            {isMarketing ? (
              <>
                <span className="text-neutral-400 block mb-1">
                  {uploading
                    ? "Uploading your resume…"
                    : "Drag & drop your resume"}
                </span>
                <span className="text-xs text-neutral-500">
                  PDF, DOC, DOCX · up to 8 MB
                </span>
              </>
            ) : (
              <>
                <h3 className="text-lg font-semibold text-neutral-900 mb-2">
                  {uploading ? `Uploading… ${progress}%` : "Upload Resume"}
                </h3>
                <p className="text-sm text-neutral-600">
                  Drag and drop or click to browse. PDF, DOC, DOCX supported.
                </p>
              </>
            )}
          </div>

          {isMarketing && (
            <span className="px-4 py-2 bg-white/5 text-xs text-white rounded-lg border border-white/10 pointer-events-none">
              Browse files
            </span>
          )}

          {uploading && (
            <div
              className={
                isMarketing
                  ? "w-full max-w-xs h-1.5 bg-white/5 rounded-full overflow-hidden"
                  : "mt-4 h-2 bg-neutral-200 rounded-full overflow-hidden max-w-xs mx-auto"
              }
            >
              <div
                className={
                  isMarketing
                    ? "h-full bg-emerald-500 transition-all duration-300"
                    : "h-full bg-blue-600 transition-all duration-300"
                }
                style={{ width: `${Math.max(progress, 8)}%` }}
              />
            </div>
          )}

          {error && (
            <div
              className={
                isMarketing
                  ? "text-xs text-red-300 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2"
                  : "mt-4 text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2 inline-block"
              }
            >
              {error}
            </div>
          )}
        </div>
      </label>
    </div>
  );
}
