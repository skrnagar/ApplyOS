import { createClient } from "@supabase/supabase-js";
import { getSupabaseConfig } from "./config";

let adminClient = null;

/** Server-only Supabase client (service role). Never import in client components. */
export function getSupabaseAdmin() {
  const { url } = getSupabaseConfig();
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

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
  return Boolean(getSupabaseConfig().url && process.env.SUPABASE_SERVICE_ROLE_KEY);
}
