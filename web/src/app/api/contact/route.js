import { getSupabaseAdmin, isSupabaseAdminConfigured } from "@/utils/supabase/admin";
import { notifyContactForm } from "../utils/notifyTeam.js";

const TEAM_INBOX =
  process.env.CONTACT_EMAIL || process.env.SUPPORT_EMAIL || "hireorbit.1@gmail.com";

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

    if (!isSupabaseAdminConfigured()) {
      return Response.json(
        {
          error:
            "Supabase is not configured on the server. Add SUPABASE_SERVICE_ROLE_KEY to .env.local and restart npm run dev.",
          stored: false,
        },
        { status: 503 },
      );
    }

    const admin = getSupabaseAdmin();
    const { data, error } = await admin
      .from("contact_submissions")
      .insert({ email, name, message })
      .select("id, email, created_at")
      .single();

    if (error) {
      console.error("POST /api/contact:", error);
      return Response.json({ error: "Failed to save message" }, { status: 500 });
    }

    await admin.from("leads").insert({
      email,
      name,
      source: "contact",
      metadata: {
        message_preview: message.slice(0, 200),
        team_inbox: TEAM_INBOX,
      },
    });

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
