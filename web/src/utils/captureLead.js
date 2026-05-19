/** Fire-and-forget lead capture to Supabase (no-op if API unavailable). */
export async function captureLead({ email, name, source, metadata }) {
  try {
    await fetch("/api/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, name, source, metadata }),
    });
  } catch {
    /* ignore */
  }
}
