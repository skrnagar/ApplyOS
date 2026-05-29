/**
 * Persist ATS report between upload and /resume-checker/results.
 */
export const ATS_REPORT_KEY = "hireorbital_ats_report";

export function saveAtsReport(report) {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(
      ATS_REPORT_KEY,
      JSON.stringify({ ...report, saved_at: Date.now() }),
    );
  } catch {
    /* quota */
  }
}

export function loadAtsReport() {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(ATS_REPORT_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function clearAtsReport() {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.removeItem(ATS_REPORT_KEY);
  } catch {
    /* ignore */
  }
}
