import { createServerClient } from "@supabase/ssr";
import type { Context, Next } from "hono";
import { getSupabaseConfig } from "./config";
import { parseCookieHeader, serializeSetCookie } from "./cookies";

type PendingCookie = {
  name: string;
  value: string;
  options?: import("@supabase/ssr").CookieOptions;
};

/**
 * Refreshes the Supabase auth session on each request (Hono equivalent of Next.js middleware).
 * Mount early in `__create/index.ts` when Supabase env vars are set.
 */
export async function supabaseSessionMiddleware(c: Context, next: Next) {
  const { url, key } = getSupabaseConfig();
  if (!url || !key) {
    return next();
  }

  let pendingCookies: PendingCookie[] = [];

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return parseCookieHeader(c.req.header("Cookie"));
      },
      setAll(cookiesToSet) {
        pendingCookies = cookiesToSet;
      },
    },
  });

  await supabase.auth.getUser();
  await next();

  for (const { name, value, options } of pendingCookies) {
    c.res.headers.append("Set-Cookie", serializeSetCookie(name, value, options ?? {}));
  }
}
