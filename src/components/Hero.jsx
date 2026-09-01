"use client";
import React from "react";
import {
  ArrowRight,
  PhoneCall,
  Sparkles,
  ShieldCheck,
  Clock3,
  Briefcase,
  FileText,
  Linkedin,
  Mail,
} from "lucide-react";
import MarketingButton from "./ui/MarketingButton";
import HeroWorkspacePreview from "./marketing/HeroWorkspacePreview";
import useUser from "@/utils/useUser";

const FEATURES = [
  { icon: Briefcase, label: "Tailored applications" },
  { icon: FileText, label: "ATS resume rewrites" },
  { icon: Linkedin, label: "LinkedIn optimization" },
  { icon: Mail, label: "Recruiter outreach" },
];

const TOP_COMPANIES = ["Google", "Amazon", "Microsoft", "Meta", "Apple"];

export default function Hero() {
  const { data: user, loading } = useUser();
  const authed = Boolean(user?.email);

  return (
    <section className="relative bg-[#f4f6f8]">
      <div className="pointer-events-none absolute inset-0 hero-atmosphere" aria-hidden />
      <div className="pointer-events-none absolute inset-0 hero-atmosphere-grid opacity-40" aria-hidden />
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#f4f6f8] to-transparent"
        aria-hidden
      />

      <div className="relative z-10 mx-auto w-full max-w-7xl xl:max-w-[1440px] 2xl:max-w-[1536px] px-4 sm:px-6 lg:px-8 xl:px-10 pt-24 sm:pt-28 pb-14 md:pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1.1fr)] gap-10 lg:gap-12 xl:gap-16 2xl:gap-20 items-center">
          {/* Copy */}
          <div className="order-1 max-w-xl lg:max-w-none mx-auto lg:mx-0 text-center lg:text-left hero-fade-in">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-emerald-200/80 bg-white/90 text-[11px] font-semibold text-emerald-800 shadow-sm mb-5">
              <Sparkles size={12} className="text-emerald-600 shrink-0" aria-hidden />
              <span className="tracking-wide uppercase">Dedicated job search assistant</span>
            </div>

            <h1 className="text-[1.875rem] leading-[1.12] sm:text-4xl sm:leading-[1.1] lg:text-[2.75rem] xl:text-[3.15rem] 2xl:text-[3.35rem] font-semibold tracking-[-0.035em] text-neutral-900">
              <span className="block">We apply to hundreds of jobs.</span>
              <span className="block mt-1.5 text-emerald-600">You get callbacks at top companies.</span>
            </h1>

            <p className="mt-4 sm:mt-5 text-neutral-600 text-[15px] sm:text-base xl:text-[17px] leading-relaxed text-pretty max-w-2xl lg:max-w-none">
              HireOrbital assigns you a dedicated assistant who applies to jobs, rewrites your
              resume for ATS, optimizes LinkedIn, and emails recruiters — so you land interviews at{" "}
              <span className="font-semibold text-neutral-900">Google, Amazon, and more</span>.
            </p>

            <div className="mt-6 sm:mt-7 flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
              <MarketingButton
                href={authed ? "/dashboard" : "/account/signup"}
                variant="cta"
                icon={ArrowRight}
                className="w-full sm:w-auto justify-center shadow-md shadow-emerald-600/15"
              >
                {loading ? "Loading…" : authed ? "Go dashboard" : "Start free"}
              </MarketingButton>
              <MarketingButton
                href="/contact"
                variant="outline"
                icon={PhoneCall}
                className="w-full sm:w-auto justify-center"
              >
                Talk to an expert
              </MarketingButton>
            </div>

            <div className="mt-4 flex flex-wrap items-center justify-center lg:justify-start gap-2 text-[11px] sm:text-xs">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-neutral-200/90 bg-white px-3 py-1.5 text-neutral-700">
                <ShieldCheck size={13} className="text-emerald-600" aria-hidden />
                Human-reviewed applications
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-neutral-200/90 bg-white px-3 py-1.5 text-neutral-700">
                <Clock3 size={13} className="text-sky-600" aria-hidden />
                Daily pipeline updates
              </span>
            </div>

            <ul className="mt-6 hidden sm:grid sm:grid-cols-2 gap-x-4 gap-y-2.5 text-sm text-neutral-600">
              {FEATURES.map(({ icon: Icon, label }) => (
                <li key={label} className="flex items-center gap-2">
                  <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-emerald-50 text-emerald-700">
                    <Icon size={14} aria-hidden />
                  </span>
                  <span className="font-medium">{label}</span>
                </li>
              ))}
            </ul>

            <p className="mt-5 text-xs text-neutral-500 hidden lg:block">
              Targeting roles at{" "}
              <span className="font-medium text-neutral-700">{TOP_COMPANIES.join(" · ")}</span>
            </p>
          </div>

          {/* Preview */}
          <div className="order-2 w-full min-w-0 hero-fade-in-delay">
            <HeroWorkspacePreview className="w-full" />
          </div>
        </div>

        {/* Stats + mobile features */}
        <div className="mt-10 lg:mt-12 max-w-xl lg:max-w-none mx-auto lg:mx-0">
          <ul className="sm:hidden grid grid-cols-2 gap-2 mb-6 text-sm text-neutral-600">
            {FEATURES.map(({ icon: Icon, label }) => (
              <li
                key={label}
                className="flex items-center gap-2 rounded-xl border border-neutral-200/80 bg-white/80 px-3 py-2"
              >
                <Icon size={14} className="text-emerald-600 shrink-0" aria-hidden />
                <span className="text-xs font-medium leading-tight">{label}</span>
              </li>
            ))}
          </ul>

          <div className="rounded-2xl border border-neutral-200/90 bg-white/90 shadow-sm px-4 sm:px-6 py-4 sm:py-5">
            <div className="grid grid-cols-3 divide-x divide-neutral-200/90">
              <Stat label="Customers" display="700+" />
              <Stat label="Applications" display="250K+" />
              <Stat label="Avg. rating" display="4.9" showStar />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Stat({ label, display, showStar = false }) {
  return (
    <div className="text-center px-2 sm:px-4">
      <div className="text-xl sm:text-2xl md:text-3xl font-semibold tracking-tight text-neutral-900 tabular-nums">
        {display}
        {showStar && <span className="text-amber-500 text-lg sm:text-xl md:text-2xl ml-0.5">★</span>}
      </div>
      <div className="mt-0.5 text-[10px] sm:text-xs tracking-wide uppercase text-neutral-500 font-medium">
        {label}
      </div>
    </div>
  );
}
