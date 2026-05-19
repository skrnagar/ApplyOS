import { createServerClient } from "@supabase/ssr";
import type { Context } from "hono";
import { getSupabaseConfig } from "./config";
import { parseCookieHeader } from "./cookies";

export type CookieStore = {
  getAll(): { name: string; value: string }[];
  setAll(
    cookies: {
      name: string;
      value: string;
      options?: import("@supabase/ssr").CookieOptions;
    }[],
  ): void;
};

/**
 * Server Supabase client for React Router loaders / server code with a cookie store.
 * Prefer Hono middleware for session refresh; use read-only `setAll` in loaders when needed.
 */
export function createClient(cookieStore: CookieStore) {
  const { url, key } = getSupabaseConfig();
  if (!url || !key) {
    throw new Error(
      "Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY in .env.local",
    );
  }

  return createServerClient(url, key, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        cookieStore.setAll(cookiesToSet);
      },
    },
  });
}

/** Supabase client bound to an incoming Hono request (read-only cookie writes). */
export function createClientFromHono(c: Context) {
  return createClient({
    getAll() {
      return parseCookieHeader(c.req.header("Cookie"));
    },
    setAll() {
      // Session refresh is handled by `supabaseSessionMiddleware` in __create/index.ts
    },
  });
}
