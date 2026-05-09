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

  const existingCount = useMemo(() => {
    void syncKey;
    return getLocalResumes(user?.id).length;
  }, [user?.id, syncKey]);

  return (
    <section className="py-32 bg-black/40 overflow-hidden relative">
      <div className="container mx-auto px-6">
        <div className="flex flex-col lg:flex-row items-center gap-20">
          <div className="flex-1">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-8">
              Experience The <br />
              <span className="text-green-400">Futuristic Dashboard</span>
            </h2>
            <p className="text-xl text-neutral-400 mb-10 leading-relaxed">
              Our onboarding process is designed to be as smooth as the career
              it builds. Upload once, set your preferences, and watch the magic
              happen.
            </p>

            <ul className="space-y-6">
              {[
                "Smart Resume Parsing",
                "Target Role Alignment",
                "Preference Synchronization",
              ].map((item, i) => (
                <li
                  key={i}
                  className="flex items-center gap-4 text-white font-medium"
                >
                  <div className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center">
                    <Check size={14} className="text-green-400" />
                  </div>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="flex-1 relative w-full max-w-lg">
            <motion.div
              initial={{ rotateY: 20, rotateX: 10, scale: 0.9, opacity: 0 }}
              whileInView={{ rotateY: 0, rotateX: 0, scale: 1, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1 }}
              className="bg-neutral-900/80 border border-white/10 backdrop-blur-xl p-8 rounded-[2rem] shadow-2xl relative z-10"
            >
              <div className="flex items-center justify-between mb-8">
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500/50" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
                  <div className="w-3 h-3 rounded-full bg-green-500/50" />
                </div>
                <div className="px-3 py-1 rounded-full bg-white/5 text-[10px] font-bold text-neutral-500 uppercase tracking-widest">
                  Step 01: Analysis
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
                    className="flex flex-col gap-2 rounded-xl border border-emerald-500/25 bg-emerald-500/10 px-4 py-3"
                  >
                    <div className="flex items-center gap-2 text-sm font-medium text-emerald-300">
                      <Sparkles size={16} />
                      Saved: {savedName}
                    </div>
                    <p className="text-xs text-neutral-400">
                      Same flow as your dashboard — stored locally if the API is
                      unavailable. Manage versions anytime.
                    </p>
                    <a
                      href="/dashboard/resumes"
                      className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 underline-offset-2 hover:underline w-fit"
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
                  <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: savedName ? "100%" : "0%" }}
                      transition={{ duration: 0.8, ease: "easeOut" }}
                      className="h-full bg-green-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="h-8 bg-white/5 rounded-lg animate-pulse"
                    />
                  ))}
                </div>
              </div>
            </motion.div>

            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-green-500/10 blur-[100px] -z-10 rounded-full" />
          </div>
        </div>
      </div>
    </section>
  );
}
