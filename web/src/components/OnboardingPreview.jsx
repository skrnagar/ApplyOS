"use client";
import React from "react";
import { motion } from "motion/react";
import { FileText, Check, ChevronRight } from "lucide-react";

export default function OnboardingPreview() {
  return (
    <section className="py-32 bg-black overflow-hidden">
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

          <div className="flex-1 relative">
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
                <div className="p-10 border-2 border-dashed border-white/10 rounded-2xl flex flex-col items-center justify-center gap-4 bg-white/[0.02]">
                  <FileText size={40} className="text-neutral-500" />
                  <div className="text-sm font-medium text-neutral-400">
                    Drag & Drop Resume
                  </div>
                  <button className="px-4 py-2 bg-white/5 text-xs text-white rounded-lg border border-white/10">
                    Browse Files
                  </button>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-medium text-neutral-500">
                    <span>Processing Data</span>
                    <span>75%</span>
                  </div>
                  <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ width: "75%" }}
                      transition={{ duration: 2, delay: 0.5 }}
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
