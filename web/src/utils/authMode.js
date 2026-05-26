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

function readBakedFlag(name) {
  const value = import.meta.env?.[name];
  if (value === "true") return true;
  if (value === "false") return false;
  return null;
}

/** Supabase auth without Auth.js — skip SessionProvider and /api/auth/session polling. */
export function usesSupabaseAuthOnly() {
  const baked = readBakedFlag("NEXT_PUBLIC_SUPABASE_AUTH_ONLY");
  if (baked !== null) return baked;
  return isSupabaseAuthEnabled() && !isServerAuthEnabled();
}

/** True when Supabase URL + anon/publishable key are set (email/password + OAuth via Supabase). */
export function isSupabaseAuthEnabled() {
  const baked = readBakedFlag("NEXT_PUBLIC_SUPABASE_AUTH");
  if (baked !== null) return baked;
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
