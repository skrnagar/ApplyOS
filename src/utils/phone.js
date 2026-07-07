/** Normalize phone for storage — keeps digits and leading + */
export function normalizePhone(value) {
  const raw = String(value || "").trim();
  if (!raw) return "";
  const hasPlus = raw.startsWith("+");
  const digits = raw.replace(/\D/g, "");
  if (!digits) return "";
  if (hasPlus) return `+${digits}`;
  if (digits.length === 10) return `+1${digits}`;
  return digits;
}

/** Optional phone — returns { ok, phone?, error? } */
export function validateOptionalPhone(value) {
  const normalized = normalizePhone(value);
  if (!normalized) return { ok: true, phone: null };
  const digits = normalized.replace(/\D/g, "");
  if (digits.length < 8 || digits.length > 15) {
    return { ok: false, error: "Enter a valid mobile number (8–15 digits)." };
  }
  return { ok: true, phone: normalized };
}
