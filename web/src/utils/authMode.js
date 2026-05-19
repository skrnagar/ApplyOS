/**
 * True when AUTH_SECRET is set at build/dev-server start (see vite `define`).
 * When false, credentials use browser local storage only — no /api/auth calls.
 */
export function isServerAuthEnabled() {
  if (typeof import.meta !== "undefined" && import.meta.env?.NEXT_PUBLIC_SERVER_AUTH === "true") {
    return true;
  }
  if (typeof process !== "undefined" && process.env?.NEXT_PUBLIC_SERVER_AUTH === "true") {
    return true;
  }
  return false;
}
