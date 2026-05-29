import { getApiAuthHeaders } from "@/utils/apiAuthHeaders";

const ADMIN_KEY = "hireorbital_admin_secret";

/** Legacy optional secret (fallback if ADMIN_EMAILS not used). */
export function getAdminSecret() {
  if (typeof window === "undefined") return null;
  try {
    return sessionStorage.getItem(ADMIN_KEY);
  } catch {
    return null;
  }
}

export function setAdminSecret(secret) {
  if (typeof window === "undefined") return;
  if (!secret) sessionStorage.removeItem(ADMIN_KEY);
  else sessionStorage.setItem(ADMIN_KEY, secret);
}

export async function adminFetch(url, options = {}) {
  const authHeaders = await getApiAuthHeaders(options.headers || {});
  const secret = getAdminSecret();
  const headers = {
    ...authHeaders,
    ...(secret ? { "X-Admin-Secret": secret } : {}),
  };

  return fetch(url, {
    ...options,
    headers,
    credentials: options.credentials ?? "same-origin",
  });
}

export async function adminFetchJson(url, options = {}) {
  let res;
  try {
    res = await adminFetch(url, options);
  } catch (err) {
    throw new Error(
      err?.message?.includes("fetch")
        ? "Could not reach the API. Is npm run dev running on this site?"
        : err?.message || "Request failed",
    );
  }

  const text = await res.text();
  let json = {};
  if (text) {
    try {
      json = JSON.parse(text);
    } catch {
      throw new Error(
        `Server returned non-JSON (${res.status}). ${text.slice(0, 120)}`,
      );
    }
  }

  if (!res.ok) {
    const msg = json.error || `Request failed (${res.status})`;
    const hint = json.hint ? ` ${json.hint}` : "";
    const err = new Error(`${msg}${hint}`);
    err.status = res.status;
    err.details = json.details;
    err.hint = json.hint;
    throw err;
  }

  return json;
}

export async function adminDeleteRecord(table, id) {
  const params = new URLSearchParams({ table, id });
  return adminFetchJson(`/api/admin/record?${params}`, { method: "DELETE" });
}

export async function checkAdminSession() {
  return adminFetchJson("/api/admin/session");
}

/** Like checkAdminSession but returns structured result instead of throwing on 401/403. */
export async function checkAdminSessionSafe() {
  try {
    const res = await adminFetch("/api/admin/session");
    const json = await res.json().catch(() => ({}));
    return {
      admin: Boolean(json.admin),
      email: json.email || null,
      error: json.error || null,
      hint: json.hint || null,
      status: res.status,
    };
  } catch (err) {
    return {
      admin: false,
      email: null,
      error: err.message || "Could not verify admin session",
      hint: err.hint || null,
      status: err.status || 500,
    };
  }
}

export async function setProfileAdmin(profileId, isAdmin) {
  return adminFetchJson("/api/admin/profile", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ profileId, is_admin: isAdmin }),
  });
}

export async function adminCreateApplication(payload) {
  return adminFetchJson("/api/admin/applications", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

export async function adminUpdateApplication(id, payload) {
  return adminFetchJson("/api/admin/applications", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id, ...payload }),
  });
}
