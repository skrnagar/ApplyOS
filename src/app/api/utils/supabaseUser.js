import { getSupabaseAdmin, getSupabaseAuthReader, isSupabaseAdminConfigured } from "@/utils/supabase/admin";
import { loadServerEnv } from "@/utils/loadServerEnv.js";
import { getOrCreateUserFromAuthJs } from "./getUser.js";

/**
 * Resolve the current user and ensure a `profiles` row in Supabase.
 * Priority: Bearer JWT → Supabase cookies (Hono) → Auth.js → local demo headers.
 */
export async function resolveRequestProfile(request) {
  loadServerEnv();
  const admin = getSupabaseAdmin();
  const authReader = getSupabaseAuthReader();
  if (!authReader) return null;

  let email = null;
  let fullName = null;
  let authUserId = null;
  let localId = null;

  const authHeader = request.headers.get("authorization");
  const localIdHeader = request.headers.get("x-hireorbital-user-id");
  const emailHeader = request.headers.get("x-hireorbital-email");
  const nameHeader = request.headers.get("x-hireorbital-name");
  const hasBearer = Boolean(authHeader?.startsWith("Bearer "));

  if (hasBearer) {
    const token = authHeader.slice(7).trim();
    const { data, error } = await authReader.auth.getUser(token);
    if (error) {
      console.error("resolveRequestProfile Bearer:", error.message);
    }
    if (data?.user?.email) {
      email = data.user.email.toLowerCase();
      authUserId = data.user.id;
      fullName =
        data.user.user_metadata?.full_name ||
        data.user.user_metadata?.name ||
        null;
    }
  }

  if (!email) {
    try {
      const { createClientFromHono } = await import("@/utils/supabase/server");
      const { getContext } = await import("hono/context-storage");
      const c = getContext();
      if (c) {
        const supabase = createClientFromHono(c);
        const { data, error } = await supabase.auth.getUser();
        if (error) {
          console.error("resolveRequestProfile cookie:", error.message);
        }
        if (data?.user?.email) {
          email = data.user.email.toLowerCase();
          fullName =
            data.user.user_metadata?.full_name ||
            data.user.user_metadata?.name ||
            null;
          authUserId = data.user.id;
        }
      }
    } catch {
      /* no hono context */
    }
  }

  if (!email) {
    const neonUser = await getOrCreateUserFromAuthJs();
    if (neonUser?.email) {
      email = neonUser.email.toLowerCase();
      fullName = neonUser.full_name || neonUser.name || null;
    }
  }

  if (!email && !hasBearer && emailHeader) {
    localId = localIdHeader;
    email = emailHeader.trim().toLowerCase();
    fullName = nameHeader?.trim() || null;
  }

  if (!email) return null;

  if (!admin) return null;

  const { data: existing } = await admin
    .from("profiles")
    .select("*")
    .eq("email", email)
    .maybeSingle();

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

  if (authUserId) {
    const { data: byAuth } = await admin
      .from("profiles")
      .select("*")
      .eq("auth_user_id", authUserId)
      .maybeSingle();
    if (byAuth) return byAuth;
  }

  const insert = {
    email,
    full_name: fullName,
    auth_user_id: authUserId,
    local_id:
      localId || (authUserId ? null : `local_${email.replace(/[^a-z0-9]/gi, "_")}`),
  };

  const { data: created, error } = await admin
    .from("profiles")
    .insert(insert)
    .select("*")
    .single();

  if (error) {
    if (error.code === "23505") {
      const { data: retry } = await admin
        .from("profiles")
        .select("*")
        .eq("email", email)
        .maybeSingle();
      if (retry) return retry;
    }
    console.error("resolveRequestProfile insert:", error);
    return null;
  }

  return created;
}

/** Guest resume upload — find or create profile by email (no auth session required). */
export async function resolveOrCreateGuestProfile(email, fullName = null, phone = null) {
  const admin = getSupabaseAdmin();
  if (!admin) return null;

  const normalized = String(email || "")
    .trim()
    .toLowerCase();
  if (!normalized || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized)) {
    return null;
  }

  const { data: existing } = await admin
    .from("profiles")
    .select("*")
    .eq("email", normalized)
    .maybeSingle();

  if (existing) {
    if (phone && !existing.phone) {
      const { data: updated } = await admin
        .from("profiles")
        .update({ phone })
        .eq("id", existing.id)
        .select("*")
        .single();
      return updated || existing;
    }
    return existing;
  }

  const guestId = `guest_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
  const { data: created, error } = await admin
    .from("profiles")
    .insert({
      email: normalized,
      full_name: fullName?.trim() || null,
      phone: phone || null,
      local_id: guestId,
    })
    .select("*")
    .single();

  if (error) {
    if (error.code === "23505") {
      const { data: retry } = await admin
        .from("profiles")
        .select("*")
        .eq("email", normalized)
        .maybeSingle();
      return retry;
    }
    console.error("resolveOrCreateGuestProfile:", error);
    return null;
  }

  return created;
}

export function isProfileStorageReady() {
  return isSupabaseAdminConfigured();
}
