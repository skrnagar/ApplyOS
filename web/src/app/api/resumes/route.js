import sql from "./utils/sql";
import { getOrCreateUser } from "./utils/getUser";

// Get all resumes for a user
export async function GET() {
  try {
    const user = await getOrCreateUser();
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
    const resumes =
      await sql`SELECT * FROM resumes WHERE user_id = ${user.id} ORDER BY is_primary DESC, created_at DESC`;
    return Response.json(resumes);
  } catch (error) {
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

// Create new resume
export async function POST(request) {
  try {
    const user = await getOrCreateUser();
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
    const body = await request.json();
    const { file_name, file_url, file_size, is_primary, ats_score } = body;
    if (!file_name || !file_url)
      return Response.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    if (is_primary) {
      await sql`UPDATE resumes SET is_primary = false WHERE user_id = ${user.id}`;
    }
    const result = await sql`
      INSERT INTO resumes (user_id, file_name, file_url, file_size, is_primary, ats_score)
      VALUES (${user.id}, ${file_name}, ${file_url}, ${file_size || null}, ${is_primary || false}, ${ats_score || null})
      RETURNING *
    `;
    return Response.json(result[0], { status: 201 });
  } catch (error) {
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
