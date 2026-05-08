import sql from "@/app/api/utils/sql";
import { getOrCreateUser } from "@/app/api/utils/getUser";

// Delete resume
export async function DELETE(request, { params }) {
  try {
    const user = await getOrCreateUser();
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
    const { id } = params;
    const result =
      await sql`DELETE FROM resumes WHERE id = ${id} AND user_id = ${user.id} RETURNING *`;
    if (result.length === 0)
      return Response.json({ error: "Resume not found" }, { status: 404 });
    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

// Update resume
export async function PATCH(request, { params }) {
  try {
    const user = await getOrCreateUser();
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
    const { id } = params;
    const body = await request.json();
    const { is_primary, ats_score } = body;
    if (is_primary) {
      await sql`UPDATE resumes SET is_primary = false WHERE user_id = ${user.id}`;
    }
    const updates = [];
    const values = [];
    let paramIndex = 1;
    if (is_primary !== undefined) {
      updates.push(`is_primary = $${paramIndex++}`);
      values.push(is_primary);
    }
    if (ats_score !== undefined) {
      updates.push(`ats_score = $${paramIndex++}`);
      values.push(ats_score);
    }
    updates.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(id);
    values.push(user.id);
    const updateQuery = `UPDATE resumes SET ${updates.join(", ")} WHERE id = $${paramIndex++} AND user_id = $${paramIndex} RETURNING *`;
    const result = await sql(updateQuery, values);
    if (result.length === 0)
      return Response.json({ error: "Resume not found" }, { status: 404 });
    return Response.json(result[0]);
  } catch (error) {
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
