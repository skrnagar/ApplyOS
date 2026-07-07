/** Public site contact — shown on marketing pages and used in mailto links. */
export const CONTACT_EMAIL = "hireorbit.1@gmail.com";

export const CONTACT_MAILTO = `mailto:${CONTACT_EMAIL}`;

export const SITE_NAME = "HireOrbital";

export const SITE_TAGLINE = "AI career operating system";

export const SITE_DESCRIPTION =
  "HireOrbital optimizes your full job search pipeline: curated applications, resume and LinkedIn upgrades, assistant support, and transparent progress tracking.";

/** Canonical origin (no trailing slash). Set NEXT_PUBLIC_SITE_URL in production. */
export function getSiteUrl() {
  const raw = import.meta.env?.NEXT_PUBLIC_SITE_URL || "https://hireorbital.com";
  return String(raw).replace(/\/$/, "");
}

export const SITE_URL = getSiteUrl();

export const DEFAULT_OG_IMAGE = `${SITE_URL}/images/og-hireorbital.svg`;

export const TWITTER_HANDLE = "@hireorbital";

export const SITE_LOCALE = "en_US";
