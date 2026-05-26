import {
  listApplications,
  createApplication,
} from "../utils/applicationsStore.js";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const result = await listApplications(request, { status });
    if (result.error) {
      return Response.json({ error: result.error }, { status: result.status });
    }
    return Response.json(result.data);
  } catch (error) {
    console.error("Error fetching applications:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { company_name, job_title } = body;
    if (!company_name || !job_title) {
      return Response.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    const result = await createApplication(request, body);
    if (result.error) {
      return Response.json({ error: result.error }, { status: result.status });
    }
    return Response.json(result.data, { status: result.status });
  } catch (error) {
    console.error("Error creating application:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
