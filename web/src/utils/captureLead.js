/** Save lead to Supabase via API. Returns { ok, stored, error? }. */
export async function captureLead({ email, name, source, metadata }) {
  try {
    const res = await fetch("/api/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, name, source, metadata }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      return {
        ok: false,
        stored: false,
        error: data.error || `Lead save failed (${res.status})`,
      };
    }
    return { ok: true, stored: Boolean(data.stored), lead: data.lead };
  } catch (err) {
    return { ok: false, stored: false, error: err?.message || "Network error" };
  }
}
