import { getSupabaseAdmin, isSupabaseAdminConfigured } from "@/utils/supabase/admin";
import { getOrCreateUser } from "./getUser.js";

/**
 * Resolve the current user and ensure a `profiles` row in Supabase.
 * Supports: Supabase Auth cookie, legacy Auth.js + Neon user, local demo session headers.
 */
export async function resolveRequestProfile(request) {
  const admin = getSupabaseAdmin();
  if (!admin) return null;

  let email = null;
  let fullName = null;
  let authUserId = null;
  let localId = null;

  const authHeader = request.headers.get("authorization");
  const localIdHeader = request.headers.get("x-hireorbit-user-id");
  const emailHeader = request.headers.get("x-hireorbit-email");
  const nameHeader = request.headers.get("x-hireorbit-name");

  if (localIdHeader && emailHeader) {
    localId = localIdHeader;
    email = emailHeader.trim().toLowerCase();
    fullName = nameHeader?.trim() || null;
  }

  if (!email) {
    try {
      const { createClientFromHono } = await import("@/utils/supabase/server");
      const { getContext } = await import("hono/context-storage");
      const c = getContext();
      if (c) {
        const supabase = createClientFromHono(c);
        const { data } = await supabase.auth.getUser();
        if (data?.user?.email) {
          email = data.user.email.toLowerCase();
          fullName = data.user.user_metadata?.full_name || data.user.user_metadata?.name || null;
          authUserId = data.user.id;
        }
      }
    } catch {
      /* no hono context */
    }
  }

  if (!email) {
    const neonUser = await getOrCreateUser();
    if (neonUser?.email) {
      email = neonUser.email.toLowerCase();
      fullName = neonUser.full_name || neonUser.name || null;
    }
  }

  if (!email && authHeader?.startsWith("Bearer ")) {
    const token = authHeader.slice(7);
    const { data } = await admin.auth.getUser(token);
    if (data?.user?.email) {
      email = data.user.email.toLowerCase();
      authUserId = data.user.id;
      fullName = data.user.user_metadata?.full_name || null;
    }
  }

  if (!email) return null;

  const { data: existing } = await admin.from("profiles").select("*").eq("email", email).maybeSingle();

  if (existing) {
    const updates = {};
    if (authUserId && !existing.auth_user_id) updates.auth_user_id = authUserId;
    if (localId && !existing.local_id) updates.local_id = localId;
    if (fullName && !existing.full_name) updates.full_name = fullName;
    if (Object.keys(updates).length > 0) {
      const { data: updated } = await admin
        .from("profiles")
        .update(updates)
        .eq("id", existing.id)
        .select("*")
        .single();
      return updated || { ...existing, ...updates };
    }
    return existing;
  }

  const insert = {
    email,
    full_name: fullName,
    auth_user_id: authUserId,
    local_id: localId || (authUserId ? null : `local_${email.replace(/[^a-z0-9]/gi, "_")}`),
  };

  const { data: created, error } = await admin.from("profiles").insert(insert).select("*").single();

  if (error) {
    console.error("resolveRequestProfile insert:", error);
    return null;
  }

  return created;
}

export function isProfileStorageReady() {
  return isSupabaseAdminConfigured();
}
