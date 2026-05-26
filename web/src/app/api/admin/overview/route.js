import { getSupabaseAdmin, isSupabaseAdminConfigured } from "@/utils/supabase/admin";
import { verifyAdminRequest } from "../../utils/adminAuth.js";

export async function GET(request) {
  const auth = verifyAdminRequest(request);
  if (!auth.ok) {
    return Response.json({ error: auth.error }, { status: auth.status });
  }

  if (!isSupabaseAdminConfigured()) {
    return Response.json(
      { error: "Supabase admin is not configured (SUPABASE_SERVICE_ROLE_KEY)." },
      { status: 503 },
    );
  }

  const admin = getSupabaseAdmin();
  const limit = 50;

  try {
    const [
      profilesRes,
      resumesRes,
      leadsRes,
      contactRes,
      chatRes,
    ] = await Promise.all([
      admin.from("profiles").select("*").order("created_at", { ascending: false }).limit(limit),
      admin
        .from("resumes")
        .select("*, profiles(email, full_name)")
        .order("created_at", { ascending: false })
        .limit(limit),
      admin.from("leads").select("*").order("created_at", { ascending: false }).limit(limit),
      admin
        .from("contact_submissions")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(limit),
      admin
        .from("chat_messages")
        .select("*, profiles(email, full_name)")
        .order("created_at", { ascending: false })
        .limit(limit),
    ]);

    const errors = [
      profilesRes.error,
      resumesRes.error,
      leadsRes.error,
      contactRes.error,
      chatRes.error,
    ].filter(Boolean);

    if (errors.length) {
      console.error("admin overview:", errors);
      const missingTable = errors.some((e) =>
        /could not find the table|relation.*does not exist/i.test(e.message || ""),
      );
      return Response.json(
        {
          error: missingTable
            ? "Database tables are missing. Run the HireOrbit migration in your Supabase project (SQL Editor or supabase db push)."
            : "Failed to load admin data from Supabase.",
          hint: "Open Supabase → SQL Editor → paste web/supabase/migrations/20250520120000_init_hireorbit.sql → Run.",
          details: errors.map((e) => e.message),
        },
        { status: 500 },
      );
    }

    const profiles = profilesRes.data || [];
    const resumes = resumesRes.data || [];
    const leads = leadsRes.data || [];
    const contact = contactRes.data || [];
    const chat = chatRes.data || [];

    return Response.json({
      counts: {
        profiles: profiles.length,
        resumes: resumes.length,
        leads: leads.length,
        contact: contact.length,
        chat: chat.length,
      },
      profiles,
      resumes,
      leads,
      contact_submissions: contact,
      chat_messages: chat,
    });
  } catch (error) {
    console.error("GET /api/admin/overview:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
