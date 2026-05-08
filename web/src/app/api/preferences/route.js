import sql from "../utils/sql.js";
import { getOrCreateUser } from "../utils/getUser.js";

// Get job preferences
export async function GET() {
  try {
    const user = await getOrCreateUser();
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
    const prefs =
      await sql`SELECT * FROM job_preferences WHERE user_id = ${user.id}`;
    if (prefs.length === 0) return Response.json(null);
    return Response.json(prefs[0]);
  } catch (error) {
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

// Create or update job preferences
export async function POST(request) {
  try {
    const user = await getOrCreateUser();
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
    const userId = user.id;
    const body = await request.json();
    const {
      target_roles,
      preferred_locations,
      work_mode,
      min_salary,
      max_salary,
      currency,
      notice_period,
      preferred_industries,
      company_size,
      visa_sponsorship,
      willing_to_relocate,
      additional_notes,
    } = body;
    const existing =
      await sql`SELECT id FROM job_preferences WHERE user_id = ${userId}`;
    if (existing.length > 0) {
      const result = await sql`
        UPDATE job_preferences SET
          target_roles = ${target_roles || []}, preferred_locations = ${preferred_locations || []},
          work_mode = ${work_mode || []}, min_salary = ${min_salary || null}, max_salary = ${max_salary || null},
          currency = ${currency || "USD"}, notice_period = ${notice_period || null},
          preferred_industries = ${preferred_industries || []}, company_size = ${company_size || []},
          visa_sponsorship = ${visa_sponsorship || false}, willing_to_relocate = ${willing_to_relocate || false},
          additional_notes = ${additional_notes || null}, updated_at = CURRENT_TIMESTAMP
        WHERE user_id = ${userId} RETURNING *
      `;
      return Response.json(result[0]);
    } else {
      const result = await sql`
        INSERT INTO job_preferences (user_id, target_roles, preferred_locations, work_mode, min_salary, max_salary, currency, notice_period, preferred_industries, company_size, visa_sponsorship, willing_to_relocate, additional_notes)
        VALUES (${userId}, ${target_roles || []}, ${preferred_locations || []}, ${work_mode || []}, ${min_salary || null}, ${max_salary || null}, ${currency || "USD"}, ${notice_period || null}, ${preferred_industries || []}, ${company_size || []}, ${visa_sponsorship || false}, ${willing_to_relocate || false}, ${additional_notes || null})
        RETURNING *
      `;
      return Response.json(result[0], { status: 201 });
    }
  } catch (error) {
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
