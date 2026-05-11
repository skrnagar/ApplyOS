"use client";
import React from "react";
import ProMarketingBackdrop from "@/components/marketing/ProMarketingBackdrop";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ScrollProgress from "@/components/ui/ScrollProgress";

export default function MarketingShell({ children, showBackdrop = true }) {
  return (
    <main className="relative min-h-screen font-inter text-neutral-900 bg-[#f4f6f8]">
      {showBackdrop ? <ProMarketingBackdrop /> : null}
      <div className="relative z-10 isolation-isolate">
        <ScrollProgress />
        <Navbar />
        {children}
        <Footer />
      </div>
    </main>
  );
}
