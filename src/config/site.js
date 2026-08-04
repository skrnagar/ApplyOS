/** Public site contact — shown on marketing pages and used in mailto links. */
export const CONTACT_EMAIL = "hireorbit.1@gmail.com";

export const CONTACT_MAILTO = `mailto:${CONTACT_EMAIL}`;

export const SITE_NAME = "HireOrbital";

/**
 * WhatsApp support line — digits only, country code first, no `+` or spaces.
 * TODO: replace the fallback with the real business number (or set
 * NEXT_PUBLIC_WHATSAPP_NUMBER); the widget hides itself while it is unset.
 */
export const WHATSAPP_NUMBER = String(
  import.meta.env?.NEXT_PUBLIC_WHATSAPP_NUMBER || "",
).replace(/\D/g, "");

/** Human-facing label for the same number, e.g. "+91 98765 43210". */
export const WHATSAPP_DISPLAY =
  import.meta.env?.NEXT_PUBLIC_WHATSAPP_DISPLAY || "";

/** Support hours used for the online/away badge (IST by default). */
export const WHATSAPP_HOURS = {
  timeZone: "Asia/Kolkata",
  timeZoneLabel: "IST",
  /** 0 = Sunday. Days the team is reachable. */
  days: [1, 2, 3, 4, 5, 6],
  startHour: 10,
  endHour: 19,
};

export const SITE_TAGLINE = "#1 Job Application Service ";

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
