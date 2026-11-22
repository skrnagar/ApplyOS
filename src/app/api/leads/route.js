import {
  getSupabaseAdmin,
  getSupabaseServerPublic,
} from "@/utils/supabase/admin";
import { notifyNewLead } from "../utils/notifyTeam.js";
import { normalizePhone } from "@/utils/phone";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function isRlsError(error) {
  return error?.code === "42501" || /row-level security/i.test(error?.message || "");
}

/** Direct insert with the service-role client. */
async function insertWithServiceRole(admin, payload) {
  return admin
    .from("leads")
    .insert(payload)
    .select("id, email, phone, source, created_at")
    .single();
}

/**
 * Fallback when the service-role key is missing/invalid or RLS blocks the insert:
 * SECURITY DEFINER RPC (see migration 20251122120000_submit_lead_rpc.sql).
 */
async function insertWithRpc({ email, name, phone, source, metadata }) {
  const client = getSupabaseServerPublic();
  if (!client) {
    return { data: null, error: { message: "Supabase is not configured on the server" } };
  }
  const { data, error } = await client.rpc("submit_lead", {
    p_email: email,
    p_name: name,
    p_phone: phone,
    p_source: source,
    p_metadata: metadata,
  });
  if (error) return { data: null, error };
  const row = Array.isArray(data) ? data[0] : data;
  if (!row?.id) return { data: null, error: { message: "Lead RPC returned no row" } };
  return { data: row, error: null };
}

async function findAccountExists(admin, email) {
  if (!admin) return false;
  try {
    const { data: profile } = await admin
      .from("profiles")
      .select("id")
      .eq("email", email)
      .maybeSingle();
    return Boolean(profile?.id);
  } catch {
    return false;
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const email = String(body.email || "")
      .trim()
      .toLowerCase();
    const name = body.name?.trim() || null;
    const phone = normalizePhone(body.phone) || null;
    const source = String(body.source || "unknown").slice(0, 64);
    const metadata = body.metadata && typeof body.metadata === "object" ? body.metadata : {};

    if (!email || !EMAIL_RE.test(email)) {
      return Response.json({ error: "Valid email is required" }, { status: 400 });
    }

    const payload = { email, name, phone, source, metadata };
    const admin = getSupabaseAdmin();

    let saved = null;
    let saveError = null;

    if (admin) {
      const direct = await insertWithServiceRole(admin, payload);
      if (!direct.error) saved = direct.data;
      else saveError = direct.error;
    }

    // No admin client, or the direct insert failed → try the RPC so the lead is not lost.
    if (!saved) {
      if (saveError && !isRlsError(saveError)) {
        console.warn("POST /api/leads: direct insert failed, trying RPC:", saveError);
      }
      const viaRpc = await insertWithRpc(payload);
      if (viaRpc.data) saved = viaRpc.data;
      else saveError = viaRpc.error ?? saveError;
    }

    if (!saved) {
      console.error("POST /api/leads: lead NOT stored:", saveError);
      // Still alert the team so the lead can be followed up manually.
      await notifyNewLead({
        email,
        name,
        phone,
        source,
        metadata: { ...metadata, storage_failed: true },
      });
      return Response.json(
        { error: "Failed to save lead", stored: false },
        { status: 500 },
      );
    }

    const accountExists = await findAccountExists(admin, email);

    // Must be awaited: on serverless hosts (Vercel) work after the response is returned
    // is frozen, so a fire-and-forget email never leaves the function.
    await notifyNewLead({ email, name, phone, source, metadata });

    return Response.json(
      { ok: true, stored: true, lead: saved, accountExists },
      { status: 201 },
    );
  } catch (error) {
    console.error("POST /api/leads:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
