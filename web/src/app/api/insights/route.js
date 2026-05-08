import sql from "./utils/sql";
import { getOrCreateUser } from "./utils/getUser";

// Get AI insights for user
export async function GET() {
  try {
    const user = await getOrCreateUser();
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
    const insights = await sql`
      SELECT * FROM ai_insights WHERE user_id = ${user.id} AND status = 'active'
        AND (expires_at IS NULL OR expires_at > CURRENT_TIMESTAMP)
      ORDER BY CASE priority WHEN 'high' THEN 1 WHEN 'medium' THEN 2 WHEN 'low' THEN 3 END, created_at DESC LIMIT 10
    `;
    return Response.json(insights);
  } catch (error) {
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

// Dismiss an insight
export async function PATCH(request) {
  try {
    const user = await getOrCreateUser();
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
    const body = await request.json();
    const { insightId } = body;
    if (!insightId)
      return Response.json({ error: "Insight ID required" }, { status: 400 });
    await sql`UPDATE ai_insights SET status = 'dismissed' WHERE id = ${insightId} AND user_id = ${user.id}`;
    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
