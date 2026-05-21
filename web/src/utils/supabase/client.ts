import { createBrowserClient } from "@supabase/ssr";
import { getSupabaseConfig } from "./config";

let browserClient: ReturnType<typeof createBrowserClient> | null = null;

/** Browser Supabase client (singleton). */
export function createClient() {
  const { url, key } = getSupabaseConfig();
  if (!url || !key) {
    throw new Error(
      "Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY in .env.local",
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

/** Returns browser client or null when env is missing (safe for optional Supabase). */
export function tryCreateBrowserClient() {
  const { url, key } = getSupabaseConfig();
  if (!url || !key) return null;
  if (typeof window !== "undefined") {
    if (!browserClient) {
      browserClient = createBrowserClient(url, key);
    }
    return browserClient;
  }
  return createBrowserClient(url, key);
}
