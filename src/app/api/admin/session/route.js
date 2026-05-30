import { verifyAdminRequest, getAdminAllowlist } from "../../utils/adminAuth.js";
import { loadServerEnv } from "@/utils/loadServerEnv.js";

loadServerEnv();

/** GET /api/admin/session — check if current Supabase session is an admin */
export async function GET(request) {
  const auth = await verifyAdminRequest(request);
  const allowlist = getAdminAllowlist();

  if (!auth.ok) {
    return Response.json(
      {
        admin: false,
        error: auth.error,
        hint: auth.hint,
        allowlistConfigured: allowlist.length > 0,
      },
      { status: auth.status },
    );
  }

  return Response.json({
    admin: true,
    method: auth.method,
    email: auth.email || null,
  });
}
