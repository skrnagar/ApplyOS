import { createBrowserClient } from "@supabase/ssr";
import { getSupabaseConfig, isSupabaseConfigured } from "./config";

let browserClient: ReturnType<typeof createBrowserClient> | null = null;

/** Browser Supabase client (singleton). */
export function createClient() {
  const { url, key } = getSupabaseConfig();
  if (!url || !key) {
    throw new Error(
      "Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL (https://YOUR_PROJECT.supabase.co) and NEXT_PUBLIC_SUPABASE_ANON_KEY in Vercel, then redeploy.",
    );
  }

  if (typeof window !== "undefined") {
    if (!browserClient) {
      browserClient = createBrowserClient(url, key);
    }
    return browserClient;
  }

  return createBrowserClient(url, key);
}

/** Returns browser client or null when env is missing or invalid (never throws). */
export function tryCreateBrowserClient() {
  if (!isSupabaseConfigured()) return null;
  const { url, key } = getSupabaseConfig();
  if (!url || !key) return null;

  try {
    if (typeof window !== "undefined") {
      if (!browserClient) {
        browserClient = createBrowserClient(url, key);
      }
      return browserClient;
    }
    return createBrowserClient(url, key);
  } catch (err) {
    console.error("[supabase] Invalid client config:", err);
    return null;
  }
}
