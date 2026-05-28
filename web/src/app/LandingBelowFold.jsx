"use client";
import DifferenceSection from "../components/marketing/DifferenceSection";
import HumanWorkSection from "../components/marketing/HumanWorkSection";
import DMSection from "../components/marketing/DMSection";
import HowItWorks from "../components/HowItWorks";
import ImpactSection from "../components/marketing/ImpactSection";
import ValueTeaser from "../components/marketing/ValueTeaser";
import LightFeatureBand from "../components/LightFeatureBand";
import Pricing from "../components/Pricing";
import PlatformPreview from "../components/PlatformPreview";
import OnboardingPreview from "../components/OnboardingPreview";
import InsightfulResources from "../components/marketing/InsightfulResources";
import Testimonials from "../components/Testimonials";
import FAQ from "../components/FAQ";
import CTA from "../components/CTA";
import NewUserSection from "../components/marketing/NewUserSection";

/** Below-the-fold homepage sections — lazy-loaded to shrink the initial JS bundle. */
export default function LandingBelowFold() {
  return (
    <>
      <DifferenceSection />
      <HumanWorkSection />
      <DMSection />
      <HowItWorks />
      <ImpactSection />
      <ValueTeaser />
      <LightFeatureBand />
      <Pricing />
      <PlatformPreview />
      <OnboardingPreview />
      <InsightfulResources />
      <Testimonials />
      <NewUserSection />
      <FAQ />
      <CTA />
    </>
  );
}
