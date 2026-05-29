/**
 * Ensure a Supabase Storage bucket exists (service role). Safe to call on each upload.
 */
export async function ensureStorageBucket(admin, bucketName, options = {}) {
  const { public: isPublic = true, fileSizeLimit = 8 * 1024 * 1024 } = options;

  const { data: buckets, error: listError } = await admin.storage.listBuckets();
  if (listError) {
    console.error(`listBuckets (${bucketName}):`, listError);
    return { ok: false, error: listError };
  }

  if (buckets?.some((b) => b.name === bucketName)) {
    return { ok: true, created: false };
  }

  const { error: createError } = await admin.storage.createBucket(bucketName, {
    public: isPublic,
    fileSizeLimit,
  });

  if (createError) {
    const msg = createError.message || "";
    if (msg.toLowerCase().includes("already exists")) {
      return { ok: true, created: false };
    }
    console.error(`createBucket (${bucketName}):`, createError);
    return { ok: false, error: createError };
  }

  return { ok: true, created: true };
}
