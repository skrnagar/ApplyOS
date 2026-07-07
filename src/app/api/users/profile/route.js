import {
  getProfileForRequest,
  updateProfileForRequest,
} from "../../utils/profileStore.js";

export async function GET(request) {
  try {
    const result = await getProfileForRequest(request);
    if (result.error) {
      return Response.json({ error: result.error }, { status: result.status });
    }
    return Response.json(result.data);
  } catch (error) {
    console.error("GET /api/users/profile:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(request) {
  try {
    const body = await request.json();
    const result = await updateProfileForRequest(request, body);
    if (result.error) {
      return Response.json({ error: result.error }, { status: result.status });
    }
    return Response.json(result.data);
  } catch (error) {
    console.error("PATCH /api/users/profile:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
