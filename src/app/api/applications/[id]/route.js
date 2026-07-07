/** User-facing mutations disabled — team manages applications via /api/admin/applications */

export async function PATCH() {
  return Response.json(
    {
      error: "Application updates are managed by the HireOrbital team.",
    },
    { status: 403 },
  );
}

export async function DELETE() {
  return Response.json(
    {
      error: "Applications are managed by the HireOrbital team.",
    },
    { status: 403 },
  );
}
