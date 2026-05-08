import sql from "../../utils/sql";
import { getOrCreateUser } from "../../utils/getUser";

// Get user profile
export async function GET() {
  try {
    const user = await getOrCreateUser();
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
    return Response.json(user);
  } catch (error) {
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

// Update user profile
export async function PATCH(request) {
  try {
    const user = await getOrCreateUser();
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
    const body = await request.json();
    const fields = [
      "full_name",
      "phone",
      "profile_image",
      "current_title",
      "current_company",
      "years_of_experience",
      "location",
      "linkedin_url",
      "github_url",
      "portfolio_url",
      "bio",
    ];
    const updates = [];
    const values = [];
    let paramIndex = 1;
    fields.forEach((f) => {
      if (body[f] !== undefined) {
        updates.push(`${f} = $${paramIndex++}`);
        values.push(body[f]);
      }
    });
    updates.push(`updated_at = CURRENT_TIMESTAMP`);
    if (updates.length === 1)
      return Response.json({ error: "No fields to update" }, { status: 400 });
    values.push(user.id);
    const updateQuery = `UPDATE users SET ${updates.join(", ")} WHERE id = $${paramIndex} RETURNING *`;
    const result = await sql(updateQuery, values);
    if (result.length === 0)
      return Response.json({ error: "User not found" }, { status: 404 });
    return Response.json(result[0]);
  } catch (error) {
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
