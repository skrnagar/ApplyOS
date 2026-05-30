import { loadServerEnv } from "@/utils/loadServerEnv.js";

loadServerEnv();

/** Public site origin for auth redirects (Supabase allowlist must include callback URLs). */
export function getSiteOrigin(request) {
  const fromEnv = process.env.AUTH_URL?.trim() || process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (fromEnv) {
    try {
      return new URL(fromEnv).origin;
    } catch {
      /* fall through */
    }
  }

  if (request) {
    try {
      const url = new URL(request.url);
      const host = request.headers.get("x-forwarded-host") || url.host;
      const proto = request.headers.get("x-forwarded-proto") || url.protocol.replace(":", "");
      if (host) return `${proto}://${host}`;
    } catch {
      /* fall through */
    }
  }

  return "http://localhost:4000";
}

export function passwordResetRedirectUrl(origin) {
  const next = encodeURIComponent("/account/reset-password");
  return `${origin}/account/auth/callback?next=${next}`;
}
