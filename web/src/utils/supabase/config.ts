const PLACEHOLDER_URL =
  /^(your[-_]?|xxx|placeholder|example|supabase[-_]?url|https?:\/\/your)/i;

function readEnv(name: string): string | undefined {
  const fromMeta = import.meta.env?.[name];
  if (typeof fromMeta === "string" && fromMeta.trim()) return fromMeta.trim();
  if (typeof process !== "undefined") {
    const fromProcess = process.env?.[name];
    if (typeof fromProcess === "string" && fromProcess.trim()) return fromProcess.trim();
  }
  return undefined;
}

/** Normalize and validate Supabase project URL (must be https://….supabase.co). */
export function normalizeSupabaseUrl(raw: string | undefined): string | null {
  if (!raw || typeof raw !== "string") return null;
  let value = raw.trim().replace(/\/+$/, "");
  if (!value || PLACEHOLDER_URL.test(value)) return null;

  if (!/^https?:\/\//i.test(value)) {
    if (/^[a-z0-9-]+\.supabase\.co$/i.test(value)) {
      value = `https://${value}`;
    } else if (/^[a-z0-9-]+$/i.test(value)) {
      value = `https://${value}.supabase.co`;
    } else {
      value = `https://${value}`;
    }
  }

  try {
    const parsed = new URL(value);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") return null;
    if (!parsed.hostname.endsWith(".supabase.co")) return null;
    return parsed.origin;
  } catch {
    return null;
  }
}

function normalizeSupabaseKey(raw: string | undefined): string | null {
  if (!raw || typeof raw !== "string") return null;
  const value = raw.trim();
  if (value.length < 20) return null;
  if (/^(your|xxx|placeholder|anon[-_]?key)/i.test(value)) return null;
  return value;
}

/** Supabase public env — validated; invalid values are dropped (prevents client crash). */
export function getSupabaseConfig(): { url: string | null; key: string | null } {
  const url = normalizeSupabaseUrl(readEnv("NEXT_PUBLIC_SUPABASE_URL"));
  const key = normalizeSupabaseKey(
    readEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY") ?? readEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY"),
  );
  return { url, key };
}

export function isSupabaseConfigured(): boolean {
  const { url, key } = getSupabaseConfig();
  return Boolean(url && key);
}
