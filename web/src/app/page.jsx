"use client";
import React from "react";
import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import LogoCloud from "../components/LogoCloud";
import HowItWorks from "../components/HowItWorks";
import DigitalTunnel from "../components/DigitalTunnel";
import Pricing from "../components/Pricing";
import PlatformPreview from "../components/PlatformPreview";
import OnboardingPreview from "../components/OnboardingPreview";
import Testimonials from "../components/Testimonials";
import FAQ from "../components/FAQ";
import CTA from "../components/CTA";
import Footer from "../components/Footer";
import CursorGlow from "../components/CursorGlow";
import ScrollProgress from "../components/ui/ScrollProgress";

export default function LandingPage() {
  return (
    <main className="relative font-inter">
      <ScrollProgress />
      <CursorGlow />
      <Navbar />

      <Hero />
      <LogoCloud />
      <HowItWorks />
      <DigitalTunnel />
      <Pricing />
      <PlatformPreview />
      <OnboardingPreview />
      <Testimonials />
      <FAQ />
      <CTA />
      <Footer />

      {/* Persistent grain overlay */}
      <div
        aria-hidden
        className="fixed inset-0 pointer-events-none z-[2] opacity-[0.035] mix-blend-overlay noise"
      />
    </main>
  );
}
