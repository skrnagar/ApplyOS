const ADMIN_HEADER = "x-admin-secret";

export function verifyAdminRequest(request) {
  const secret = process.env.ADMIN_SECRET;
  if (!secret) {
    return { ok: false, status: 503, error: "ADMIN_SECRET is not configured on the server." };
  }
  const provided =
    request.headers.get(ADMIN_HEADER) ||
    request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  if (!provided || provided !== secret) {
    return { ok: false, status: 401, error: "Unauthorized" };
  }
  return { ok: true };
}

export { ADMIN_HEADER };
