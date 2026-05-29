import { getSupabaseAdmin, isSupabaseAdminConfigured } from "@/utils/supabase/admin";
import { resolveRequestProfile } from "../utils/supabaseUser.js";
import { ensureStorageBucket } from "@/utils/supabase/ensureStorageBucket";

const BUCKET = "uploads";
const MAX_BYTES = 4 * 1024 * 1024;
const IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

export async function POST(request) {
  if (!isSupabaseAdminConfigured()) {
    return Response.json(
      { error: "Upload is not configured. Add SUPABASE_SERVICE_ROLE_KEY." },
      { status: 503 },
    );
  }

  const profile = await resolveRequestProfile(request);
  if (!profile) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  let formData;
  try {
    formData = await request.formData();
  } catch {
    return Response.json({ error: "Invalid form data" }, { status: 400 });
  }

  const file = formData.get("file");
  if (!file || typeof file === "string") {
    return Response.json({ error: "No file provided" }, { status: 400 });
  }

  if (file.size > MAX_BYTES) {
    return Response.json({ error: "File too large (max 4 MB)" }, { status: 400 });
  }

  const mime = file.type || "";
  if (!IMAGE_TYPES.has(mime)) {
    return Response.json(
      { error: "Only JPEG, PNG, WebP, and GIF images are supported" },
      { status: 400 },
    );
  }

  const admin = getSupabaseAdmin();
  const bucketResult = await ensureStorageBucket(admin, BUCKET, {
    public: true,
    fileSizeLimit: MAX_BYTES,
  });
  if (!bucketResult.ok) {
    return Response.json({ error: "Storage is not available" }, { status: 500 });
  }

  const safeName = (file.name || "image").replace(/[^a-zA-Z0-9._-]/g, "_");
  const storagePath = `${profile.id}/${Date.now()}-${safeName}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  const { error: uploadError } = await admin.storage.from(BUCKET).upload(storagePath, buffer, {
    contentType: mime,
    upsert: false,
  });

  if (uploadError) {
    console.error("POST /api/upload storage:", uploadError);
    return Response.json({ error: "Upload failed" }, { status: 500 });
  }

  const { data: publicUrlData } = admin.storage.from(BUCKET).getPublicUrl(storagePath);

  return Response.json({
    url: publicUrlData.publicUrl,
    mimeType: mime,
  });
}
