import sql from "./sql.js";

// Get or create a user in our users table from the auth session
export async function getOrCreateUser() {
  let session = null;
  try {
    const authModule = await import("../../../auth.js");
    session = await authModule.auth();
  } catch (err) {
    // In deployment environments where internal auth aliasing is unavailable,
    // gracefully fall back to unauthenticated behavior.
    return null;
  }
  if (!session?.user?.email) return null;

  const email = session.user.email;
  const name = session.user.name || null;

  try {
    const existing =
      await sql`SELECT * FROM users WHERE email = ${email} LIMIT 1`;
    if (existing.length > 0) return existing[0];

    // Create user record linked to this auth account
    const newUser = await sql`
      INSERT INTO users (email, full_name, onboarding_completed)
      VALUES (${email}, ${name}, false)
      RETURNING *
    `;
    return newUser[0];
  } catch (err) {
    console.error("getOrCreateUser error:", err);
    return null;
  }
}
