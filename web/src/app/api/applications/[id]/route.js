import sql from "../../utils/sql.js";
import { getOrCreateUser } from "../../utils/getUser.js";

// Update application
export async function PATCH(request, { params }) {
  try {
    const user = await getOrCreateUser();
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
    const userId = user.id;
    const { id } = params;
    const body = await request.json();
    const updates = [];
    const values = [];
    let paramIndex = 1;
    const allowedFields = [
      "status",
      "notes",
      "interview_date",
      "interview_type",
      "interview_notes",
      "offer_amount",
      "offer_currency",
      "rejection_reason",
      "position",
    ];
    allowedFields.forEach((field) => {
      if (body[field] !== undefined) {
        updates.push(`${field} = $${paramIndex++}`);
        values.push(body[field]);
      }
    });
    updates.push(`updated_at = CURRENT_TIMESTAMP`);
    if (updates.length === 1)
      return Response.json({ error: "No fields to update" }, { status: 400 });
    values.push(id);
    values.push(userId);
    const updateQuery = `UPDATE applications SET ${updates.join(", ")} WHERE id = $${paramIndex++} AND user_id = $${paramIndex} RETURNING *`;
    const result = await sql(updateQuery, values);
    if (result.length === 0)
      return Response.json({ error: "Application not found" }, { status: 404 });
    return Response.json(result[0]);
  } catch (error) {
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

// Delete application
export async function DELETE(request, { params }) {
  try {
    const user = await getOrCreateUser();
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
    const { id } = params;
    const result =
      await sql`DELETE FROM applications WHERE id = ${id} AND user_id = ${user.id} RETURNING *`;
    if (result.length === 0)
      return Response.json({ error: "Application not found" }, { status: 404 });
    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
