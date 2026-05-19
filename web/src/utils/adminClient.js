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

export function adminFetch(url, options = {}) {
  const secret = getAdminSecret();
  const headers = {
    ...(options.headers || {}),
    "X-Admin-Secret": secret || "",
  };
  return fetch(url, { ...options, headers });
}
