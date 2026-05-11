const KEY_NEW = (userId) => `hireorbit_local_resumes_${userId || "guest"}`;
const KEY_OLD = (userId) => `applyai_local_resumes_${userId || "guest"}`;

function safeParse(value, fallback) {
  try {
    return JSON.parse(value ?? "");
  } catch {
    return fallback;
  }
}

function migrateResumesKey(userId) {
  if (typeof window === "undefined") return;
  const kNew = KEY_NEW(userId);
  const kOld = KEY_OLD(userId);
  const next = window.localStorage.getItem(kNew);
  if (next) return;
  const prev = window.localStorage.getItem(kOld);
  if (prev) {
    window.localStorage.setItem(kNew, prev);
  }
}

export function getLocalResumes(userId) {
  if (typeof window === "undefined") return [];
  migrateResumesKey(userId);
  return safeParse(window.localStorage.getItem(KEY_NEW(userId)), []);
}

export function setLocalResumes(userId, resumes) {
  if (typeof window === "undefined") return;
  migrateResumesKey(userId);
  window.localStorage.setItem(KEY_NEW(userId), JSON.stringify(resumes));
}

export function addLocalResume(userId, resume) {
  const resumes = getLocalResumes(userId);
  const next = [resume, ...resumes];
  setLocalResumes(userId, next);
  return next;
}
