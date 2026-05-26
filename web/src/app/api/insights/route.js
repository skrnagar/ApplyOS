import sql from "../utils/sql.js";
import { getOrCreateUser } from "../utils/getUser.js";
import { isNeonDatabaseConfigured } from "../utils/dbConfig.js";

export async function GET(request) {
  try {
    const user = await getOrCreateUser(request);
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

    if (!user._neonLinked || !isNeonDatabaseConfigured()) {
      return Response.json([]);
    }

    const insights = await sql`
      SELECT * FROM ai_insights WHERE user_id = ${user.id} AND status = 'active'
        AND (expires_at IS NULL OR expires_at > CURRENT_TIMESTAMP)
      ORDER BY CASE priority WHEN 'high' THEN 1 WHEN 'medium' THEN 2 WHEN 'low' THEN 3 END, created_at DESC LIMIT 10
    `;
    return Response.json(insights);
  } catch (error) {
    console.error("GET /api/insights:", error);
    return Response.json([]);
  }
}

export async function PATCH(request) {
  try {
    const user = await getOrCreateUser(request);
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

    if (!user._neonLinked || !isNeonDatabaseConfigured()) {
      return Response.json({ success: true });
    }

    const body = await request.json();
    const { insightId } = body;
    if (!insightId) {
      return Response.json({ error: "Insight ID required" }, { status: 400 });
    }
    await sql`UPDATE ai_insights SET status = 'dismissed' WHERE id = ${insightId} AND user_id = ${user.id}`;
    return Response.json({ success: true });
  } catch (error) {
    console.error("PATCH /api/insights:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
