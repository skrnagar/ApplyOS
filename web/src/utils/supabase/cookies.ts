import type { CookieOptions } from "@supabase/ssr";

export type CookiePair = { name: string; value: string };

/** Parse `Cookie` request header into name/value pairs. */
export function parseCookieHeader(header: string | undefined): CookiePair[] {
  if (!header) return [];
  return header
    .split(";")
    .map((part) => {
      const eq = part.indexOf("=");
      if (eq === -1) return null;
      const name = part.slice(0, eq).trim();
      const value = part.slice(eq + 1).trim();
      if (!name) return null;
      return { name, value };
    })
    .filter((c): c is CookiePair => c !== null);
}

/** Serialize a `Set-Cookie` header value. */
export function serializeSetCookie(
  name: string,
  value: string,
  options: CookieOptions = {},
): string {
  const parts = [`${name}=${encodeURIComponent(value)}`];
  if (options.maxAge !== undefined) parts.push(`Max-Age=${options.maxAge}`);
  if (options.expires) {
    parts.push(`Expires=${options.expires instanceof Date ? options.expires.toUTCString() : options.expires}`);
  }
  if (options.path) parts.push(`Path=${options.path}`);
  if (options.domain) parts.push(`Domain=${options.domain}`);
  if (options.sameSite) {
    const site =
      typeof options.sameSite === "string"
        ? options.sameSite.charAt(0).toUpperCase() + options.sameSite.slice(1).toLowerCase()
        : options.sameSite;
    parts.push(`SameSite=${site}`);
  }
  if (options.secure) parts.push("Secure");
  if (options.httpOnly) parts.push("HttpOnly");
  return parts.join("; ");
}
