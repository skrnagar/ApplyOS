import { auth } from "../../../auth.js";
import sql from "./sql.js";

// Get or create a user in our users table from the auth session
export async function getOrCreateUser() {
  const session = await auth();
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
