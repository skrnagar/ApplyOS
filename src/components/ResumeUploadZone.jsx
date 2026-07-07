"use client";
import React, { useCallback, useId, useState } from "react";
import { FileText, FileUp, Upload } from "lucide-react";
import { useNavigate } from "react-router";
import AtsResultPanel from "@/components/AtsResultPanel";
import useUser from "@/utils/useUser";
import { saveAtsReport } from "@/utils/atsReportSession";
import {
  RESUME_ACCEPT,
  saveResumeRecord,
  validateGuestEmail,
  validateResumeFile,
} from "@/utils/resumeUpload";
import { validateOptionalPhone } from "@/utils/phone";

/**
 * Shared resume upload: drag-drop, browse, validation, ATS scan, Supabase storage.
 * @param {"marketing" | "dashboard"} variant
 */
export default function ResumeUploadZone({
  variant = "dashboard",
  userId,
  existingCount = 0,
  disabled = false,
  onSuccess,
  redirectToResults = false,
  hideInlineResult = false,
  jobProfileLabel = "",
  onJobProfileLabelChange,
  className = "",
}) {
  const navigate = useNavigate();
  const inputId = useId();
  const emailInputId = useId();
  const phoneInputId = useId();
  const { data: user } = useUser();
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [result, setResult] = useState(null);

  const isMarketing = variant === "marketing";
  const needsEmail = isMarketing && !user?.email;

  const runUpload = useCallback(
    async (file) => {
      const v = validateResumeFile(file);
      if (!v.ok) {
        setError(v.error);
        return;
      }

      let guestEmail = null;
      let guestPhone = null;
      if (needsEmail) {
        const ev = validateGuestEmail(email);
        if (!ev.ok) {
          setError(ev.error);
          return;
        }
        guestEmail = ev.email;
        const pv = validateOptionalPhone(phone);
        if (!pv.ok) {
          setError(pv.error);
          return;
        }
        guestPhone = pv.phone;
      }

      setUploading(true);
      setError(null);
      setResult(null);
      setProgress(15);
      try {
        setProgress(45);
        const payload = await saveResumeRecord(file, userId, existingCount, {
          email: guestEmail,
          phone: guestPhone,
          job_profile_label: !isMarketing ? jobProfileLabel : undefined,
        });
        setProgress(100);
        const resultPayload = {
          fileName: file.name,
          atsScore: payload.ats_score,
          atsGrade: payload.ats_grade,
          atsFeedback: payload.ats_feedback,
          atsCategories: payload.ats_categories,
          atsSummary: payload.ats_summary,
          saved: payload.saved !== false,
          guest: payload.guest || needsEmail,
          source: payload.source,
        };
        setResult(resultPayload);

        saveAtsReport({
          file_name: file.name,
          file_size: file.size,
          ats_score: payload.ats_score,
          ats_grade: payload.ats_grade,
          ats_feedback: payload.ats_feedback,
          ats_categories: payload.ats_categories,
          ats_summary: payload.ats_summary,
          saved: payload.saved !== false,
          guest: (payload.guest || needsEmail) && !user?.email,
          source: payload.source,
          resume_id: payload.resume?.id,
        });

        onSuccess?.(payload);

        if (redirectToResults) {
          navigate("/resume-checker/results");
        }
      } catch (err) {
        if (err.needEmail) {
          setError("Enter your email above to save your resume and ATS report.");
          if (err.ats_score != null) {
            setResult({
              fileName: file.name,
              atsScore: err.ats_score,
              atsGrade: err.ats_grade,
              atsFeedback: err.ats_feedback,
              saved: false,
              guest: true,
              source: "analyze_only",
            });
          }
        } else {
          setError(err?.message || "Upload failed. Please try again.");
          if (err.ats_score != null) {
            setResult({
              fileName: file.name,
              atsScore: err.ats_score,
              atsGrade: err.ats_grade,
              atsFeedback: err.ats_feedback,
              saved: false,
              guest: needsEmail,
              source: "analyze_only",
            });
          }
        }
      } finally {
        setTimeout(() => setProgress(0), 500);
        setUploading(false);
      }
    },
    [userId, existingCount, onSuccess, needsEmail, email, phone, redirectToResults, navigate, user?.email, jobProfileLabel, isMarketing],
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

  const shell = isMarketing
    ? `rounded-2xl border-2 border-dashed transition-all flex flex-col items-center justify-center gap-4 bg-neutral-50 ${
        dragActive
          ? "border-emerald-500/50 bg-emerald-50 shadow-sm ring-1 ring-emerald-200/60"
          : "border-neutral-200 hover:border-emerald-300/70 hover:bg-emerald-50/40"
      }`
    : `border-2 border-dashed rounded-2xl p-12 transition-all text-center ${
        dragActive
          ? "border-blue-500 bg-blue-50/70"
          : "border-neutral-300 hover:border-blue-500 hover:bg-blue-50/50"
      }`;

  return (
    <div className={`space-y-4 ${className}`}>
      {!isMarketing && onJobProfileLabelChange && (
        <div>
          <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
            Job profile / role focus
          </label>
          <input
            type="text"
            value={jobProfileLabel}
            onChange={(e) => onJobProfileLabelChange(e.target.value)}
            placeholder="e.g. Backend Engineer, Product Manager, Data Analyst…"
            disabled={disabled || uploading}
            className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400"
          />
          <p className="text-[11px] text-neutral-400 mt-1">
            Upload a separate resume for each job profile you target
          </p>
        </div>
      )}
      {needsEmail && (
        <div className="space-y-4">
          <div>
            <label
              htmlFor={emailInputId}
              className="block text-xs font-semibold text-neutral-700 mb-1.5"
            >
              Email — we&apos;ll save your ATS report and resume
            </label>
            <input
              id={emailInputId}
              type="email"
              autoComplete="email"
              placeholder="you@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={disabled || uploading}
              suppressHydrationWarning
              className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400"
            />
          </div>
          <div>
            <label
              htmlFor={phoneInputId}
              className="block text-xs font-semibold text-neutral-700 mb-1.5"
            >
              Mobile number <span className="font-normal text-neutral-400">(optional)</span>
            </label>
            <input
              id={phoneInputId}
              type="tel"
              autoComplete="tel"
              inputMode="tel"
              placeholder="+1 555 123 4567"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              disabled={disabled || uploading}
              suppressHydrationWarning
              className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400"
            />
          </div>
        </div>
      )}

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
                  ? "text-emerald-600"
                  : "mx-auto text-blue-600 mb-4"
              }
              size={isMarketing ? 40 : 48}
            />
          ) : isMarketing ? (
            <FileText size={40} className="text-neutral-400" />
          ) : (
            <Upload className="mx-auto text-neutral-400 mb-4" size={48} />
          )}

          <div className="text-sm font-medium text-center">
            {isMarketing ? (
              <>
                <span className="text-neutral-700 block mb-1">
                  {uploading
                    ? "Scanning & uploading your resume…"
                    : "Drag & drop your resume"}
                </span>
                <span className="text-xs text-neutral-500">
                  PDF, DOC, DOCX · up to 8 MB · instant ATS score
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
            <span className="px-4 py-2 bg-white text-xs text-neutral-800 rounded-lg border border-neutral-200 shadow-sm pointer-events-none font-medium">
              Browse files
            </span>
          )}

          {uploading && (
            <div
              className={
                isMarketing
                  ? "w-full max-w-xs h-1.5 bg-neutral-200 rounded-full overflow-hidden"
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
                  ? "text-xs text-red-700 bg-red-50 border border-red-100 rounded-lg px-3 py-2"
                  : "mt-4 text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2 inline-block"
              }
            >
              {error}
            </div>
          )}
        </div>
      </label>

      {result && !hideInlineResult && (
        <AtsResultPanel
          fileName={result.fileName}
          atsScore={result.atsScore}
          atsGrade={result.atsGrade}
          atsFeedback={result.atsFeedback}
          saved={result.saved}
          guest={result.guest}
          source={result.source}
        />
      )}

      {result && hideInlineResult && !redirectToResults && (
        <a
          href="/resume-checker/results"
          className="block text-center text-sm font-semibold text-emerald-700 hover:text-emerald-800"
        >
          View full ATS report →
        </a>
      )}
    </div>
  );
}
