"use client";
import React, { useMemo, useState } from "react";
import { motion } from "motion/react";
import { Check, Sparkles } from "lucide-react";
import ResumeUploadZone from "@/components/ResumeUploadZone";
import useUser from "@/utils/useUser";
import { getLocalResumes } from "@/utils/localResumes";

export default function OnboardingPreview() {
  const { data: user } = useUser();
  const [syncKey, setSyncKey] = useState(0);
  const [savedName, setSavedName] = useState(null);

  const existingCount = useMemo(
    () => getLocalResumes(user?.id).length,
    [user?.id, syncKey],
  );

  return (
    <section className="py-20 md:py-28 bg-[#f4f6f8] overflow-hidden relative border-t border-neutral-200/70">
      <div className="container mx-auto px-5 sm:px-6">
        <div className="flex flex-col lg:flex-row items-stretch gap-12 lg:gap-16">
          <div className="flex-1 flex flex-col justify-center">
            <h2 className="text-3xl md:text-4xl font-semibold text-neutral-900 mb-5 tracking-tight">
              Try the flow —{' '}
              <span className="text-emerald-700">upload once</span>
            </h2>
            <p className="text-base md:text-lg text-neutral-600 mb-8 leading-relaxed max-w-lg">
              Same resume pipeline as the dashboard. Set preferences after upload and keep every
              version under your control.
            </p>

            <ul className="space-y-4 mb-8">
              {[
                "Smart resume parsing",
                "Target role alignment",
                "Preference synchronization",
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-3 text-neutral-900 font-medium text-sm md:text-base">
                  <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center shrink-0 border border-emerald-200/80">
                    <Check size={16} className="text-emerald-700" aria-hidden />
                  </div>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="flex-1 relative w-full max-w-lg mx-auto lg:mx-0 lg:max-w-xl">
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.55 }}
              className="bg-white border border-neutral-200/90 p-6 sm:p-8 rounded-2xl shadow-[0_24px_48px_-16px_rgba(15,23,42,0.1)] relative z-10"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex gap-2" aria-hidden>
                  <div className="w-3 h-3 rounded-full bg-red-200" />
                  <div className="w-3 h-3 rounded-full bg-amber-200" />
                  <div className="w-3 h-3 rounded-full bg-emerald-200" />
                </div>
                <div className="px-3 py-1 rounded-full bg-neutral-100 text-[10px] font-bold text-neutral-600 uppercase tracking-widest border border-neutral-200/80">
                  Step 01 · Analysis
                </div>
              </div>

              <div className="space-y-6">
                <ResumeUploadZone
                  variant="marketing"
                  userId={user?.id}
                  existingCount={existingCount}
                  onSuccess={({ resume }) => {
                    setSavedName(resume.file_name);
                    setSyncKey((k) => k + 1);
                  }}
                />

                {savedName && (
                  <motion.div
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col gap-2 rounded-xl border border-emerald-200 bg-emerald-50/80 px-4 py-3"
                  >
                    <div className="flex items-center gap-2 text-sm font-semibold text-emerald-900">
                      <Sparkles size={16} aria-hidden />
                      Saved: {savedName}
                    </div>
                    <p className="text-xs text-emerald-800/90 leading-relaxed">
                      Stored locally when the API is unavailable — syncs when you&apos;re signed in.
                    </p>
                    <a
                      href="/dashboard/resumes"
                      className="text-xs font-semibold text-emerald-800 underline-offset-2 hover:underline w-fit"
                    >
                      Open resume manager →
                    </a>
                  </motion.div>
                )}

                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-medium text-neutral-500">
                    <span>Ready for preferences</span>
                    <span>{savedName ? "100%" : "0%"}</span>
                  </div>
                  <div className="h-1.5 w-full bg-neutral-100 rounded-full overflow-hidden border border-neutral-200/80">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: savedName ? "100%" : "0%" }}
                      transition={{ duration: 0.6, ease: "easeOut" }}
                      className="h-full bg-emerald-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="h-8 bg-neutral-100 rounded-lg border border-neutral-100 animate-pulse" />
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
