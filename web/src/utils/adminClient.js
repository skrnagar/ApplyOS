const ADMIN_KEY = "hireorbit_admin_secret";

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
  const secret = getAdminSecret();
  const headers = {
    ...(options.headers || {}),
    "X-Admin-Secret": secret || "",
  };

  const res = await fetch(url, {
    ...options,
    headers,
    credentials: options.credentials ?? "same-origin",
  });

  return res;
}

/** Parse JSON admin API response; throws with a clear message on failure. */
export async function adminFetchJson(url, options = {}) {
  const secret = getAdminSecret();
  if (!secret?.trim()) {
    throw new Error("Enter your admin secret to unlock the dashboard.");
  }

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
