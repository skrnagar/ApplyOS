import { isNeonDatabaseConfigured } from "./dbConfig.js";
import sql from "./sql.js";

export function userFromSupabaseProfile(profile) {
  return {
    id: profile.id,
    email: profile.email,
    full_name: profile.full_name,
    phone: profile.phone ?? null,
    profile_image: profile.profile_image ?? null,
    current_title: profile.current_title ?? null,
    current_company: profile.current_company ?? null,
    years_of_experience: profile.years_of_experience ?? null,
    location: profile.location ?? null,
    linkedin_url: profile.linkedin_url ?? null,
    github_url: profile.github_url ?? null,
    portfolio_url: profile.portfolio_url ?? null,
    bio: profile.bio ?? null,
    onboarding_completed: profile.onboarding_completed ?? false,
    _neonLinked: false,
    _profile: profile,
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
 * Resolve app user from the incoming request (Supabase profile first, then Neon / Auth.js).
 */
export async function getOrCreateUser(request) {
  if (request) {
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
            console.error("getOrCreateUser neon bridge:", err);
          }
        }
        return userFromSupabaseProfile(profile);
      }
    } catch (err) {
      console.error("getOrCreateUser supabase:", err);
    }

    const emailHeader = request.headers.get("x-hireorbital-email");
    const nameHeader = request.headers.get("x-hireorbital-name");
    const hasBearer = request.headers.get("authorization")?.startsWith("Bearer ");
    if (emailHeader && !hasBearer) {
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
  }

  return getOrCreateUserFromAuthJs();
}
