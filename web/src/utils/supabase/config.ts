/** Supabase public env — prefer Vite `import.meta.env` (inlined at build); fall back to `process.env`. */
export function getSupabaseConfig() {
  const url =
    import.meta.env?.NEXT_PUBLIC_SUPABASE_URL ||
    (typeof process !== "undefined" ? process.env?.NEXT_PUBLIC_SUPABASE_URL : undefined);

  const key =
    import.meta.env?.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    import.meta.env?.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    (typeof process !== "undefined"
      ? process.env?.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
        process.env?.NEXT_PUBLIC_SUPABASE_ANON_KEY
      : undefined);

  return { url, key };
}

export function isSupabaseConfigured() {
  const { url, key } = getSupabaseConfig();
  return Boolean(url && key);
}
