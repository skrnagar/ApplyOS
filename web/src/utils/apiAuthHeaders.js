import { getLocalSession } from "./localAuth";

/** Attach demo/local session headers for API calls when not using Supabase Auth cookies. */
export function getApiAuthHeaders(extra = {}) {
  const headers = { ...extra };
  const session = typeof window !== "undefined" ? getLocalSession() : null;
  if (session?.email) {
    headers["X-HireOrbit-User-Id"] = session.id || session.email;
    headers["X-HireOrbit-Email"] = session.email;
    if (session.name) headers["X-HireOrbit-Name"] = session.name;
  }
  return headers;
}

export async function fetchWithAuth(url, options = {}) {
  const headers = getApiAuthHeaders(options.headers || {});
  return fetch(url, { ...options, headers });
}
