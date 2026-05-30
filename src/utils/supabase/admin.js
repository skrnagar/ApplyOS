import { createClient } from "@supabase/supabase-js";
import { getSupabaseConfig, normalizeSupabaseUrl } from "./config";
import { loadServerEnv } from "../loadServerEnv.js";

let adminClient = null;

function readServerEnvValue(name) {
  loadServerEnv();
  if (typeof process !== "undefined") {
    const value = process.env?.[name];
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  return undefined;
}

/** Reject publishable/anon keys mistakenly set as SUPABASE_SERVICE_ROLE_KEY on Vercel. */
export function isValidServiceRoleKey(key) {
  if (!key || typeof key !== "string") return false;
  const trimmed = key.trim();
  if (trimmed.length < 20) return false;
  if (trimmed.startsWith("sb_publishable_")) return false;

  if (trimmed.startsWith("eyJ")) {
    try {
      const payload = JSON.parse(
        Buffer.from(trimmed.split(".")[1], "base64url").toString("utf8"),
      );
      return payload?.role === "service_role";
    } catch {
      return false;
    }
  }

  if (trimmed.startsWith("sb_secret_")) return true;
  return false;
}

export function getServiceRoleKey() {
  const key = readServerEnvValue("SUPABASE_SERVICE_ROLE_KEY");
  if (!key || !isValidServiceRoleKey(key)) return null;
  return key;
}

function getServerSupabaseUrl() {
  return (
    normalizeSupabaseUrl(readServerEnvValue("NEXT_PUBLIC_SUPABASE_URL")) ??
    getSupabaseConfig().url
  );
}

function getServerPublicKey() {
  const fromProcess =
    readServerEnvValue("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY") ??
    readServerEnvValue("NEXT_PUBLIC_SUPABASE_ANON_KEY");
  if (fromProcess && fromProcess.length >= 20) return fromProcess;
  return getSupabaseConfig().key;
}

/** Server-only Supabase client (service role). Never import in client components. */
export function getSupabaseAdmin() {
  const url = getServerSupabaseUrl();
  const serviceKey = getServiceRoleKey();

  if (!url || !serviceKey) {
    return null;
  }

  if (!adminClient) {
    adminClient = createClient(url, serviceKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }

  return adminClient;
}

export function isSupabaseAdminConfigured() {
  return Boolean(getServerSupabaseUrl() && getServiceRoleKey());
}

/** Public Supabase client for server-side RPC fallbacks (publishable/anon key). */
export function getSupabaseServerPublic() {
  const url = getServerSupabaseUrl();
  const key = getServerPublicKey();
  if (!url || !key) return null;
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

/** Client for verifying user JWTs when service role is misconfigured. */
export function getSupabaseAuthReader() {
  return getSupabaseAdmin() ?? getSupabaseServerPublic();
}
