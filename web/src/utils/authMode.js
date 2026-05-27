import { isSupabaseConfigured } from "./supabase/config";

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

/** True when Supabase URL + anon key are present and valid (runtime). */
export function isSupabaseAuthEnabled() {
  return isSupabaseConfigured();
}

/** Supabase auth without Auth.js — skip SessionProvider and /api/auth/session polling. */
export function usesSupabaseAuthOnly() {
  const baked = readBakedFlag("NEXT_PUBLIC_SUPABASE_AUTH_ONLY");
  if (baked !== null && isSupabaseConfigured()) return baked;
  return isSupabaseAuthEnabled() && !isServerAuthEnabled();
}

/** Auth.js session polling — only when AUTH_SECRET / server auth is enabled at build. */
export function shouldUseAuthJsSession() {
  return isServerAuthEnabled();
}
