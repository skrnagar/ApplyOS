import { loadServerEnv } from "@/utils/loadServerEnv.js";
import { getSupabaseAdmin, isSupabaseAdminConfigured } from "@/utils/supabase/admin";

loadServerEnv();

const ADMIN_HEADER = "x-admin-secret";

/** Optional bootstrap list in .env — also sets is_admin on first successful login */
export function getAdminAllowlist() {
  const raw = process.env.ADMIN_EMAILS || process.env.ADMIN_EMAIL || "";
  return raw
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

async function resolveSupabaseAuthEmail(request) {
  if (!isSupabaseAdminConfigured()) return null;

  const authHeader = request.headers.get("authorization");
  const admin = getSupabaseAdmin();

  if (authHeader?.startsWith("Bearer ")) {
    const token = authHeader.slice(7).trim();
    const { data, error } = await admin.auth.getUser(token);
    if (!error && data?.user?.email) {
      return data.user.email.toLowerCase();
    }
  }

  try {
    const { createClientFromHono } = await import("@/utils/supabase/server");
    const { getContext } = await import("hono/context-storage");
    const c = getContext();
    if (c) {
      const supabase = createClientFromHono(c);
      const { data, error } = await supabase.auth.getUser();
      if (!error && data?.user?.email) {
        return data.user.email.toLowerCase();
      }
    }
  } catch {
    /* no hono context */
  }

  return null;
}

async function profileIsAdmin(email) {
  const admin = getSupabaseAdmin();
  const allowlist = getAdminAllowlist();

  let { data: profile } = await admin
    .from("profiles")
    .select("id, is_admin")
    .eq("email", email)
    .maybeSingle();

  if (profile?.is_admin) return true;

  if (allowlist.includes(email)) {
    if (profile?.id) {
      await admin.from("profiles").update({ is_admin: true }).eq("id", profile.id);
    } else {
      const { data: created } = await admin
        .from("profiles")
        .insert({ email, is_admin: true })
        .select("id")
        .maybeSingle();
      profile = created;
    }
    return true;
  }

  return false;
}

/**
 * Admin: legacy ADMIN_SECRET, or Supabase Auth + profiles.is_admin in the database.
 * Passwords are always stored in Supabase Auth (auth.users), not in profiles.
 */
export async function verifyAdminRequest(request) {
  const secret = process.env.ADMIN_SECRET?.trim();
  const headerSecret = (
    request.headers.get(ADMIN_HEADER) ||
    request.headers.get("X-Admin-Secret") ||
    ""
  ).trim();

  if (secret && headerSecret && headerSecret === secret) {
    return { ok: true, method: "secret" };
  }

  if (!isSupabaseAdminConfigured()) {
    if (secret && !headerSecret) {
      return {
        ok: false,
        status: 401,
        error: "Admin secret required.",
        hint: "Configure SUPABASE_SERVICE_ROLE_KEY for database-backed admin login.",
      };
    }
    if (headerSecret) {
      return { ok: false, status: 401, error: "Invalid admin secret." };
    }
    return {
      ok: false,
      status: 503,
      error: "Supabase is not configured on the server.",
      hint: "Add SUPABASE_SERVICE_ROLE_KEY to web/.env.local.",
    };
  }

  const email = await resolveSupabaseAuthEmail(request);

  if (email) {
    const isAdmin = await profileIsAdmin(email);
    if (isAdmin) {
      return { ok: true, method: "supabase", email };
    }
    return {
      ok: false,
      status: 403,
      error: "This account does not have admin access.",
      hint: `Signed in as ${email}. In Supabase SQL Editor run: update public.profiles set is_admin = true where email = '${email}';`,
    };
  }

  if (headerSecret) {
    return { ok: false, status: 401, error: "Invalid admin secret." };
  }

  return {
    ok: false,
    status: 401,
    error: "Sign in with your Supabase admin account.",
    hint:
      "Use the same email/password as the app. Admin access requires profiles.is_admin = true in Supabase (or ADMIN_EMAILS in .env for bootstrap).",
  };
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
