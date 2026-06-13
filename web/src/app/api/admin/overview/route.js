import { getSupabaseAdmin, isSupabaseAdminConfigured } from "@/utils/supabase/admin";
import { verifyAdminRequest } from "../../utils/adminAuth.js";
import { loadServerEnv } from "@/utils/loadServerEnv.js";

loadServerEnv();

const LIMIT = 200;

async function safeQuery(label, fn) {
  try {
    const result = await fn();
    if (result.error) {
      return { data: [], error: `${label}: ${result.error.message}` };
    }
    return { data: result.data ?? [] };
  } catch (err) {
    return { data: [], error: `${label}: ${err?.message || "failed"}` };
  }
}

export async function GET(request) {
  const auth = await verifyAdminRequest(request);
  if (!auth.ok) {
    return Response.json(
      { error: auth.error, hint: auth.hint },
      { status: auth.status },
    );
  }

  if (!isSupabaseAdminConfigured()) {
    return Response.json(
      {
        error: "Supabase admin is not configured (SUPABASE_SERVICE_ROLE_KEY).",
        hint: "Add SUPABASE_SERVICE_ROLE_KEY to web/.env.local and restart npm run dev.",
      },
      { status: 503 },
    );
  }

  const admin = getSupabaseAdmin();
  const warnings = [];

  const profilesR = await safeQuery("profiles", () =>
    admin.from("profiles").select("*").order("created_at", { ascending: false }).limit(LIMIT),
  );
  if (profilesR.error) warnings.push(profilesR.error);

  const leadsR = await safeQuery("leads", () =>
    admin.from("leads").select("*").order("created_at", { ascending: false }).limit(LIMIT),
  );
  if (leadsR.error) warnings.push(leadsR.error);

  const contactR = await safeQuery("contact_submissions", () =>
    admin
      .from("contact_submissions")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(LIMIT),
  );
  if (contactR.error) warnings.push(contactR.error);

  let resumesR = await safeQuery("resumes", () =>
    admin
      .from("resumes")
      .select("*, profiles(email, full_name, phone)")
      .order("created_at", { ascending: false })
      .limit(LIMIT),
  );
  if (resumesR.error) {
    warnings.push(resumesR.error);
    resumesR = await safeQuery("resumes", () =>
      admin.from("resumes").select("*").order("created_at", { ascending: false }).limit(LIMIT),
    );
  }

  let chatR = await safeQuery("chat_messages", () =>
    admin
      .from("chat_messages")
      .select("*, profiles(email, full_name, phone)")
      .order("created_at", { ascending: false })
      .limit(LIMIT),
  );
  if (chatR.error) {
    warnings.push(chatR.error);
    chatR = await safeQuery("chat_messages", () =>
      admin.from("chat_messages").select("*").order("created_at", { ascending: false }).limit(LIMIT),
    );
  }

  let applicationsR = await safeQuery("applications", () =>
    admin
      .from("applications")
      .select("*, profiles(email, full_name, phone)")
      .order("created_at", { ascending: false })
      .limit(LIMIT),
  );
  if (applicationsR.error) {
    warnings.push(applicationsR.error);
    applicationsR = await safeQuery("applications", () =>
      admin.from("applications").select("*").order("created_at", { ascending: false }).limit(LIMIT),
    );
  }

  let auth_users = [];
  try {
    const { data: authData, error: authError } = await admin.auth.admin.listUsers({
      page: 1,
      perPage: LIMIT,
    });
    if (authError) {
      warnings.push(`auth.users: ${authError.message}`);
    } else {
      auth_users = (authData?.users || []).map((u) => ({
        id: u.id,
        email: u.email,
        created_at: u.created_at,
        last_sign_in_at: u.last_sign_in_at,
        email_confirmed_at: u.email_confirmed_at,
        user_metadata: u.user_metadata,
      }));
    }
  } catch (err) {
    warnings.push(`auth.users: ${err?.message || "failed"}`);
  }

  const profiles = profilesR.data;
  const leads = leadsR.data;
  const contact_submissions = contactR.data;
  const resumes = resumesR.data;
  const chat_messages = chatR.data;
  const applications = applicationsR.data;

  const profileById = Object.fromEntries(profiles.map((p) => [p.id, p]));

  const enrichProfile = (rows) =>
    rows.map((row) => {
      if (row.profiles?.email) return row;
      const p = profileById[row.profile_id];
      if (!p) return row;
      return { ...row, profiles: { email: p.email, full_name: p.full_name } };
    });

  return Response.json({
    ok: true,
    warnings,
    counts: {
      profiles: profiles.length,
      resumes: resumes.length,
      leads: leads.length,
      contact: contact_submissions.length,
      chat: chat_messages.length,
      applications: applications.length,
      auth_users: auth_users.length,
    },
    profiles,
    resumes: enrichProfile(resumes),
    leads,
    contact_submissions,
    chat_messages: enrichProfile(chat_messages),
    applications: enrichProfile(applications),
    auth_users,
  });
}
