import { getLocalSession, signOutLocal } from "./localAuth";
import { isSupabaseAuthEnabled } from "./authMode";
import { tryCreateBrowserClient } from "./supabase/client";

/** Attach auth headers for API calls. Supabase session wins over stale local demo storage. */
export async function getApiAuthHeaders(extra = {}) {
  const headers = { ...extra };

  if (typeof window !== "undefined" && isSupabaseAuthEnabled()) {
    const supabase = tryCreateBrowserClient();
    if (supabase) {
      const { data } = await supabase.auth.getSession();
      const token = data.session?.access_token;
      if (token) {
        signOutLocal();
        headers.Authorization = `Bearer ${token}`;
        return headers;
      }
    }
  }

  const session = typeof window !== "undefined" ? getLocalSession() : null;
  if (session?.email) {
    headers["X-HireOrbital-User-Id"] = session.id || session.email;
    headers["X-HireOrbital-Email"] = session.email;
    if (session.name) headers["X-HireOrbital-Name"] = session.name;
  }

  return headers;
}

export async function fetchWithAuth(url, options = {}) {
  const headers = await getApiAuthHeaders(options.headers || {});
  return fetch(url, {
    ...options,
    headers,
    credentials: options.credentials ?? "same-origin",
  });
}

/** Ensure server-side `profiles` row exists after Supabase sign-in. */
export async function syncAuthProfile() {
  if (typeof window === "undefined") return null;

  const supabase = tryCreateBrowserClient();
  if (supabase) {
    const { data } = await supabase.auth.getSession();
    if (!data.session?.access_token) return null;
  }

  const res = await fetchWithAuth("/api/auth/sync", { method: "POST" });
  if (res.status === 401) return null;
  return res;
}
