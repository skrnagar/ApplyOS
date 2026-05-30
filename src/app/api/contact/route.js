import {
  getSupabaseAdmin,
  getSupabaseServerPublic,
  getServiceRoleKey,
  isValidServiceRoleKey,
} from "@/utils/supabase/admin";
import { getSupabaseConfig } from "@/utils/supabase/config";
import { notifyContactForm } from "../utils/notifyTeam.js";

const TEAM_INBOX =
  process.env.CONTACT_EMAIL || process.env.SUPPORT_EMAIL || "hireorbit.1@gmail.com";

function isRlsError(error) {
  return error?.code === "42501" || /row-level security/i.test(error?.message || "");
}

function isMissingRpc(error) {
  return (
    error?.code === "PGRST202" ||
    /submit_contact_submission/i.test(error?.message || "") ||
    /function.*does not exist/i.test(error?.message || "")
  );
}

async function saveViaServiceRole(admin, { email, name, message }) {
  return admin
    .from("contact_submissions")
    .insert({ email, name, message })
    .select("id, email, created_at")
    .single();
}

async function saveViaRpc({ email, name, message }) {
  const client = getSupabaseServerPublic();
  if (!client) {
    return {
      data: null,
      error: { message: "Supabase public client unavailable on server" },
    };
  }

  const { data, error } = await client.rpc("submit_contact_submission", {
    p_email: email,
    p_name: name,
    p_message: message,
  });

  if (error) return { data: null, error };

  const row = Array.isArray(data) ? data[0] : data;
  if (!row?.id) {
    return { data: null, error: { message: "Contact RPC returned no row" } };
  }

  return { data: row, error: null };
}

async function saveContactSubmission(payload) {
  const serviceKey = getServiceRoleKey();
  const admin = getSupabaseAdmin();

  if (!serviceKey) {
    return saveViaRpc(payload);
  }

  if (admin) {
    const direct = await saveViaServiceRole(admin, payload);
    if (!direct.error && direct.data) return direct;
    if (direct.error && !isRlsError(direct.error) && !isMissingRpc(direct.error)) {
      return direct;
    }
  }

  return saveViaRpc(payload);
}

async function saveLeadRecord({ email, name, message }) {
  const admin = getSupabaseAdmin();
  const payload = {
    email,
    name,
    source: "contact",
    metadata: {
      message_preview: message.slice(0, 200),
      team_inbox: TEAM_INBOX,
    },
  };

  if (admin) {
    const { error } = await admin.from("leads").insert(payload);
    if (!error) return;
    if (!isRlsError(error)) return;
  }

  const publicClient = getSupabaseServerPublic();
  if (!publicClient) return;
  await publicClient.from("leads").insert(payload);
}

export async function POST(request) {
  try {
    const body = await request.json();
    const email = String(body.email || "")
      .trim()
      .toLowerCase();
    const name = body.name?.trim() || null;
    const message = String(body.message || "").trim();

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return Response.json({ error: "Valid email is required" }, { status: 400 });
    }
    if (!message || message.length < 10) {
      return Response.json({ error: "Message must be at least 10 characters" }, { status: 400 });
    }

    const { url, key } = getSupabaseConfig();
    if (!url || !key) {
      return Response.json(
        {
          error:
            "Supabase is not configured. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY.",
          stored: false,
        },
        { status: 503 },
      );
    }

    const rawServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
    if (rawServiceKey && !isValidServiceRoleKey(rawServiceKey)) {
      console.warn(
        "POST /api/contact: SUPABASE_SERVICE_ROLE_KEY is not a service role secret — using RPC fallback.",
      );
    }

    const { data, error: saveError } = await saveContactSubmission({ email, name, message });

    if (saveError || !data) {
      console.error("POST /api/contact:", saveError);
      const hint = isMissingRpc(saveError)
        ? "Run web/supabase/migrations/20250529120000_contact_rpc.sql in Supabase SQL Editor."
        : rawServiceKey && !getServiceRoleKey()
          ? "In Vercel, set SUPABASE_SERVICE_ROLE_KEY to the service_role secret (not the publishable key)."
          : undefined;
      return Response.json(
        { error: "Failed to save message", hint, stored: false },
        { status: 500 },
      );
    }

    try {
      await saveLeadRecord({ email, name, message });
    } catch (leadError) {
      console.warn("POST /api/contact: lead insert skipped:", leadError);
    }

    void notifyContactForm({ email, name, message });

    return Response.json(
      { ok: true, stored: true, submission: data, teamEmail: TEAM_INBOX },
      { status: 201 },
    );
  } catch (error) {
    console.error("POST /api/contact:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
