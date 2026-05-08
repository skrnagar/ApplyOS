import sql from "../utils/sql";
import { getOrCreateUser } from "../utils/getUser";

// Get messages between user and assistant
export async function GET() {
  try {
    const user = await getOrCreateUser();
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
    const messages = await sql`
      SELECT m.*, a.name as assistant_name, a.avatar as assistant_avatar
      FROM messages m LEFT JOIN assistants a ON m.assistant_id = a.id
      WHERE m.user_id = ${user.id} ORDER BY m.created_at ASC LIMIT 100
    `;
    return Response.json(messages);
  } catch (error) {
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

// Send a message
export async function POST(request) {
  try {
    const user = await getOrCreateUser();
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
    const body = await request.json();
    const { content } = body;
    if (!content)
      return Response.json({ error: "Content is required" }, { status: 400 });
    const result = await sql`
      INSERT INTO messages (user_id, assistant_id, sender_type, content)
      VALUES (${user.id}, ${user.assigned_assistant_id || null}, 'user', ${content})
      RETURNING *
    `;
    return Response.json(result[0], { status: 201 });
  } catch (error) {
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
