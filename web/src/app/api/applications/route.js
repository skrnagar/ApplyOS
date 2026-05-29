import {
  listApplications,
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

export async function POST() {
  return Response.json(
    {
      error: "Applications are submitted by the HireOrbital team on your behalf.",
      hint: "You can view your applications in the dashboard once our team logs them.",
    },
    { status: 403 },
  );
}
