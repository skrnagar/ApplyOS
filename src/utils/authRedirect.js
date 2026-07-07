/** Safe post-login destination — never send users back into auth flows. */
export function normalizePostAuthPath(path) {
  if (!path || !path.startsWith("/") || path.startsWith("//")) return "/dashboard";
  if (
    path.startsWith("/account/signin") ||
    path.startsWith("/account/signup") ||
    path.startsWith("/account/forgot-password") ||
    path.startsWith("/account/auth/callback")
  ) {
    return "/dashboard";
  }
  return path;
}

/** Resolve callbackUrl query param (or default) after successful auth. */
export function resolveAuthRedirectPath(callbackUrl) {
  if (!callbackUrl) return "/dashboard";
  try {
    return normalizePostAuthPath(decodeURIComponent(callbackUrl));
  } catch {
    return normalizePostAuthPath(callbackUrl);
  }
}

export function readCallbackUrlFromSearch(search = "") {
  if (typeof window !== "undefined" && !search) {
    search = window.location.search;
  }
  const raw = new URLSearchParams(search).get("callbackUrl");
  return raw ? resolveAuthRedirectPath(raw) : "/dashboard";
}
