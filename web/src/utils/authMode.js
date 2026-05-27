/**
 * True when AUTH_SECRET is set at build/dev-server start (see vite `define`).
 * When false, credentials use browser local storage only — no /api/auth calls.
 */
export function isServerAuthEnabled() {
  return import.meta.env?.NEXT_PUBLIC_SERVER_AUTH === "true";
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

/** Auth.js session polling — only when AUTH_SECRET / server auth is enabled at build. */
export function shouldUseAuthJsSession() {
  return isServerAuthEnabled();
}

/** True when Supabase URL + anon/publishable key are set (email/password + OAuth via Supabase). */
export function isSupabaseAuthEnabled() {
  const baked = readBakedFlag("NEXT_PUBLIC_SUPABASE_AUTH");
  if (baked !== null) return baked;
  const url = import.meta.env?.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    import.meta.env?.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    import.meta.env?.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return Boolean(url && key);
}
