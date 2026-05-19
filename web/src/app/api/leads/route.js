import { getSupabaseAdmin, isSupabaseAdminConfigured } from "@/utils/supabase/admin";

export async function POST(request) {
  try {
    const body = await request.json();
    const email = String(body.email || "")
      .trim()
      .toLowerCase();
    const name = body.name?.trim() || null;
    const source = body.source || "unknown";
    const metadata = body.metadata && typeof body.metadata === "object" ? body.metadata : {};

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return Response.json({ error: "Valid email is required" }, { status: 400 });
    }

    if (!isSupabaseAdminConfigured()) {
      return Response.json({ ok: true, stored: false, reason: "supabase_not_configured" });
    }

    const admin = getSupabaseAdmin();
    const { data, error } = await admin
      .from("leads")
      .insert({ email, name, source, metadata })
      .select("id, email, source, created_at")
      .single();

    if (error) {
      console.error("POST /api/leads:", error);
      return Response.json({ error: "Failed to save lead" }, { status: 500 });
    }

    return Response.json({ ok: true, stored: true, lead: data }, { status: 201 });
  } catch (error) {
    console.error("POST /api/leads:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
