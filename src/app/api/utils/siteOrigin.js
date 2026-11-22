import { loadServerEnv } from "@/utils/loadServerEnv.js";

loadServerEnv();

function isLocalHost(hostname) {
  return /^(localhost|127\.0\.0\.1|0\.0\.0\.0|\[::1\])$/.test(hostname);
}

const PRODUCTION_ORIGIN = "https://hireorbital.com";

/** Public site origin for auth redirects (Supabase allowlist must include callback URLs). */
export function getSiteOrigin(request) {
  const isProd = process.env.NODE_ENV === "production";

  // Try each configured origin; in production never accept a localhost one
  // (a leftover AUTH_URL=http://localhost:... made reset emails point at localhost).
  for (const raw of [process.env.AUTH_URL, process.env.NEXT_PUBLIC_SITE_URL]) {
    const value = raw?.trim();
    if (!value) continue;
    try {
      const url = new URL(value);
      if (isProd && isLocalHost(url.hostname)) continue;
      return url.origin;
    } catch {
      /* try next */
    }
  }

  if (request) {
    try {
      const url = new URL(request.url);
      const host = request.headers.get("x-forwarded-host") || url.host;
      const proto = request.headers.get("x-forwarded-proto") || url.protocol.replace(":", "");
      const hostname = host?.split(":")[0] ?? "";
      if (host && !(isProd && isLocalHost(hostname))) return `${proto}://${host}`;
    } catch {
      /* fall through */
    }
  }

  return isProd ? PRODUCTION_ORIGIN : "http://localhost:4000";
}

export function passwordResetRedirectUrl(origin) {
  const next = encodeURIComponent("/account/reset-password");
  return `${origin}/account/auth/callback?next=${next}`;
}
