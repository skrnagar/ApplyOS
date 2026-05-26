import {
  updateApplication,
  deleteApplication,
} from "../../utils/applicationsStore.js";

export async function PATCH(request, { params }) {
  try {
    const { id } = params;
    const body = await request.json();
    const result = await updateApplication(request, id, body);
    if (result.error) {
      return Response.json({ error: result.error }, { status: result.status });
    }
    return Response.json(result.data);
  } catch (error) {
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = params;
    const result = await deleteApplication(request, id);
    if (result.error) {
      return Response.json({ error: result.error }, { status: result.status });
    }
    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
