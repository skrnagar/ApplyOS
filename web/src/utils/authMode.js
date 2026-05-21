/**
 * True when AUTH_SECRET is set at build/dev-server start (see vite `define`).
 * When false, credentials use browser local storage only — no /api/auth calls.
 */
export function isServerAuthEnabled() {
  if (typeof import.meta !== "undefined" && import.meta.env?.NEXT_PUBLIC_SERVER_AUTH === "true") {
    return true;
  }
  if (typeof process !== "undefined" && process.env?.NEXT_PUBLIC_SERVER_AUTH === "true") {
    return true;
  }
  return false;
}

/** True when Supabase URL + anon/publishable key are set (email/password + OAuth via Supabase). */
export function isSupabaseAuthEnabled() {
  const url =
    (typeof import.meta !== "undefined" && import.meta.env?.NEXT_PUBLIC_SUPABASE_URL) ||
    (typeof process !== "undefined" && process.env?.NEXT_PUBLIC_SUPABASE_URL);
  const key =
    (typeof import.meta !== "undefined" &&
      (import.meta.env?.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
        import.meta.env?.NEXT_PUBLIC_SUPABASE_ANON_KEY)) ||
    (typeof process !== "undefined" &&
      (process.env?.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env?.NEXT_PUBLIC_SUPABASE_ANON_KEY));
  return Boolean(url && key);
}
