import sql from "@/app/api/utils/sql";
import { getOrCreateUser } from "@/app/api/utils/getUser";

// Get all applications for a user
export async function GET(request) {
  try {
    const user = await getOrCreateUser();
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
    const userId = user.id;

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    let applications;
    if (status) {
      applications =
        await sql`SELECT * FROM applications WHERE user_id = ${userId} AND status = ${status} ORDER BY created_at DESC`;
    } else {
      applications =
        await sql`SELECT * FROM applications WHERE user_id = ${userId} ORDER BY created_at DESC`;
    }
    return Response.json(applications);
  } catch (error) {
    console.error("Error fetching applications:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

// Create new application
export async function POST(request) {
  try {
    const user = await getOrCreateUser();
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
    const userId = user.id;

    const body = await request.json();
    const {
      job_id,
      company_name,
      job_title,
      job_location,
      company_logo,
      status,
      cover_letter,
      notes,
      source,
      application_url,
    } = body;
    if (!company_name || !job_title)
      return Response.json(
        { error: "Missing required fields" },
        { status: 400 },
      );

    const result = await sql`
      INSERT INTO applications (user_id, job_id, company_name, job_title, job_location, company_logo, status, cover_letter, notes, source, application_url)
      VALUES (${userId}, ${job_id || null}, ${company_name}, ${job_title}, ${job_location || null},
              ${company_logo || null}, ${status || "applied"}, ${cover_letter || null},
              ${notes || null}, ${source || null}, ${application_url || null})
      RETURNING *
    `;
    return Response.json(result[0], { status: 201 });
  } catch (error) {
    console.error("Error creating application:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
