import { loadServerEnv } from "@/utils/loadServerEnv.js";

loadServerEnv();

const ADMIN_HEADER = "x-admin-secret";

export function verifyAdminRequest(request) {
  const secret = process.env.ADMIN_SECRET?.trim();
  if (!secret) {
    return {
      ok: false,
      status: 503,
      error: "ADMIN_SECRET is not configured on the server.",
      hint: "Add ADMIN_SECRET to web/.env.local and restart npm run dev.",
    };
  }

  const provided = (
    request.headers.get(ADMIN_HEADER) ||
    request.headers.get("X-Admin-Secret") ||
    request.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ||
    ""
  ).trim();

  if (!provided || provided !== secret) {
    return { ok: false, status: 401, error: "Invalid admin secret." };
  }
  return { ok: true };
}

export const ADMIN_TABLES = [
  "leads",
  "profiles",
  "resumes",
  "contact_submissions",
  "chat_messages",
  "applications",
];

export { ADMIN_HEADER };
