const PENDING_KEY = "hireorbital_pending_leads";
const MAX_PENDING = 20;

function readPending() {
  try {
    const list = JSON.parse(localStorage.getItem(PENDING_KEY) || "[]");
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}

function writePending(list) {
  try {
    if (list.length) localStorage.setItem(PENDING_KEY, JSON.stringify(list.slice(-MAX_PENDING)));
    else localStorage.removeItem(PENDING_KEY);
  } catch {
    /* storage unavailable — nothing more we can do client-side */
  }
}

async function postLead(lead) {
  const res = await fetch("/api/leads", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(lead),
  });
  const data = await res.json().catch(() => ({}));
  return { res, data };
}

/**
 * Save lead to the API. Returns { ok, stored, error? }.
 * Transient failures (network / 5xx) are queued locally and retried on the next visit
 * via `flushPendingLeads()` so a lead is never lost to a blip.
 */
export async function captureLead({ email, name, phone, source, metadata }) {
  const lead = { email, name, phone, source, metadata };
  try {
    const { res, data } = await postLead(lead);
    if (!res.ok) {
      // 4xx = bad input, retrying will not help; 5xx = worth retrying later.
      if (res.status >= 500) {
        writePending([...readPending().filter((l) => l.email !== email), lead]);
      }
      return {
        ok: false,
        stored: false,
        error: data.error || `Lead save failed (${res.status})`,
      };
    }
    return {
      ok: true,
      stored: Boolean(data.stored),
      lead: data.lead,
      accountExists: Boolean(data.accountExists),
    };
  } catch (err) {
    writePending([...readPending().filter((l) => l.email !== email), lead]);
    return { ok: false, stored: false, error: err?.message || "Network error" };
  }
}

/** Retry leads that failed to save earlier. Safe to call on every page load. */
export async function flushPendingLeads() {
  if (typeof window === "undefined") return;
  const pending = readPending();
  if (!pending.length) return;

  const remaining = [];
  for (const lead of pending) {
    try {
      const { res } = await postLead(lead);
      if (!res.ok && res.status >= 500) remaining.push(lead);
    } catch {
      remaining.push(lead);
    }
  }
  writePending(remaining);
}
