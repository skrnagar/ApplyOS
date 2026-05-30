import { loadServerEnv } from "@/utils/loadServerEnv.js";

loadServerEnv();

/** True when DATABASE_URL points at a real Neon host (not the .env.example placeholder). */
export function isNeonDatabaseConfigured() {
  const url = process.env.DATABASE_URL;
  if (!url || typeof url !== "string") return false;

  const trimmed = url.trim();
  if (!trimmed) return false;

  // Common copy-paste placeholders
  if (/@host(\/|:|\?|$)/i.test(trimmed)) return false;
  if (/password@host/i.test(trimmed)) return false;

  try {
    const parsed = new URL(trimmed.replace(/^postgresql:\/\//, "http://"));
    const host = parsed.hostname?.toLowerCase();
    if (!host || host === "host") return false;
    if (parsed.username === "user" && host === "host") return false;
    return true;
  } catch {
    return false;
  }
}
