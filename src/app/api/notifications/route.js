import sql from "../utils/sql.js";

// Get notifications for user
export async function GET(request) {
  try {
    const userId = request.headers.get("x-user-id");
    if (!userId) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const notifications = await sql`
      SELECT * FROM notifications
      WHERE user_id = ${userId}
      ORDER BY created_at DESC
      LIMIT 50
    `;

    return Response.json(notifications);
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

// Mark notification as read
export async function PATCH(request) {
  try {
    const userId = request.headers.get("x-user-id");
    if (!userId) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { notificationId } = body;

    if (notificationId) {
      await sql`
        UPDATE notifications 
        SET is_read = true 
        WHERE id = ${notificationId} AND user_id = ${userId}
      `;
    } else {
      // Mark all as read
      await sql`
        UPDATE notifications 
        SET is_read = true 
        WHERE user_id = ${userId}
      `;
    }

    return Response.json({ success: true });
  } catch (error) {
    console.error("Error updating notifications:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
