import { isNeonDatabaseConfigured } from "./dbConfig.js";
import sql from "./sql.js";

export function userFromSupabaseProfile(profile) {
  return {
    id: profile.id,
    email: profile.email,
    full_name: profile.full_name,
    onboarding_completed: profile.onboarding_completed ?? false,
    _neonLinked: false,
  };
}

export function userFromLocalHeaders(email, name) {
  const normalized = email.trim().toLowerCase();
  return {
    id: `local_${normalized.replace(/[^a-z0-9]/gi, "_")}`,
    email: normalized,
    full_name: name?.trim() || null,
    onboarding_completed: false,
    _neonLinked: false,
  };
}

export async function ensureNeonUserByEmail(email, name = null) {
  if (!isNeonDatabaseConfigured()) return null;

  const normalized = email.trim().toLowerCase();
  const existing =
    await sql`SELECT * FROM users WHERE email = ${normalized} LIMIT 1`;
  if (existing.length > 0) {
    return { ...existing[0], _neonLinked: true };
  }

  const newUser = await sql`
    INSERT INTO users (email, full_name, onboarding_completed)
    VALUES (${normalized}, ${name}, false)
    RETURNING *
  `;
  return { ...newUser[0], _neonLinked: true };
}

/** Auth.js session only — used as fallback inside resolveRequestProfile. */
export async function getOrCreateUserFromAuthJs() {
  let session = null;
  try {
    const authModule = await import("../../../auth.js");
    session = await authModule.auth();
  } catch {
    return null;
  }
  if (!session?.user?.email) return null;

  if (!isNeonDatabaseConfigured()) return null;

  try {
    return await ensureNeonUserByEmail(
      session.user.email,
      session.user.name || null,
    );
  } catch (err) {
    console.error("getOrCreateUserFromAuthJs error:", err);
    return null;
  }
}

/**
 * Resolve app user from the incoming request (Supabase profile, local headers, or Neon + Auth.js).
 */
export async function getOrCreateUser(request) {
  if (request) {
    const emailHeader = request.headers.get("x-hireorbit-email");
    const nameHeader = request.headers.get("x-hireorbit-name");
    if (emailHeader) {
      if (isNeonDatabaseConfigured()) {
        try {
          const user = await ensureNeonUserByEmail(emailHeader, nameHeader);
          if (user) return user;
        } catch (err) {
          console.error("getOrCreateUser local headers:", err);
        }
      }
      return userFromLocalHeaders(emailHeader, nameHeader);
    }

    try {
      const { resolveRequestProfile } = await import("./supabaseUser.js");
      const profile = await resolveRequestProfile(request);
      if (profile?.email) {
        if (isNeonDatabaseConfigured()) {
          try {
            const neonUser = await ensureNeonUserByEmail(
              profile.email,
              profile.full_name,
            );
            if (neonUser) return neonUser;
          } catch (err) {
            console.error("getOrCreateUser supabase bridge:", err);
          }
        }
        return userFromSupabaseProfile(profile);
      }
    } catch (err) {
      console.error("getOrCreateUser supabase:", err);
    }
  }

  return getOrCreateUserFromAuthJs();
}
