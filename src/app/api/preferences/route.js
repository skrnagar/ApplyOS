import {
  getPreferencesForRequest,
  savePreferencesForRequest,
} from "../utils/profileStore.js";

export async function GET(request) {
  try {
    const result = await getPreferencesForRequest(request);
    if (result.error) {
      return Response.json({ error: result.error }, { status: result.status });
    }
    return Response.json(result.data);
  } catch (error) {
    console.error("GET /api/preferences:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const result = await savePreferencesForRequest(request, body);
    if (result.error) {
      return Response.json({ error: result.error }, { status: result.status });
    }
    return Response.json(result.data, { status: result.status || 200 });
  } catch (error) {
    console.error("POST /api/preferences:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
