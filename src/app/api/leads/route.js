import { getSupabaseAdmin, isSupabaseAdminConfigured } from "@/utils/supabase/admin";
import { notifyNewLead } from "../utils/notifyTeam.js";
import { normalizePhone } from "@/utils/phone";

export async function POST(request) {
  try {
    const body = await request.json();
    const email = String(body.email || "")
      .trim()
      .toLowerCase();
    const name = body.name?.trim() || null;
    const phone = normalizePhone(body.phone) || null;
    const source = body.source || "unknown";
    const metadata = body.metadata && typeof body.metadata === "object" ? body.metadata : {};

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return Response.json({ error: "Valid email is required" }, { status: 400 });
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

    const { data: existingProfile } = await admin
      .from("profiles")
      .select("id")
      .eq("email", email)
      .maybeSingle();

    let accountExists = Boolean(existingProfile?.id);
    if (!accountExists) {
      try {
        const { data: authList, error: authListError } = await admin.auth.admin.listUsers({
          page: 1,
          perPage: 200,
        });
        if (!authListError) {
          accountExists = (authList?.users ?? []).some(
            (u) => u.email?.toLowerCase() === email,
          );
        }
      } catch {
        /* keep profile-only result */
      }
    }

    const { data, error } = await admin
      .from("leads")
      .insert({ email, name, phone, source, metadata })
      .select("id, email, phone, source, created_at")
      .single();

    if (error) {
      console.error("POST /api/leads:", error);
      return Response.json({ error: "Failed to save lead" }, { status: 500 });
    }

    void notifyNewLead({ email, name, phone, source, metadata });

    return Response.json(
      { ok: true, stored: true, lead: data, accountExists },
      { status: 201 },
    );
  } catch (error) {
    console.error("POST /api/leads:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
