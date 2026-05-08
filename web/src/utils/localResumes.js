const keyFor = (userId) => `applyai_local_resumes_${userId || "guest"}`;

function safeParse(value, fallback) {
  try {
    return JSON.parse(value ?? "");
  } catch {
    return fallback;
  }
}

export function getLocalResumes(userId) {
  if (typeof window === "undefined") return [];
  return safeParse(window.localStorage.getItem(keyFor(userId)), []);
}

export function setLocalResumes(userId, resumes) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(keyFor(userId), JSON.stringify(resumes));
}

export function addLocalResume(userId, resume) {
  const resumes = getLocalResumes(userId);
  const next = [resume, ...resumes];
  setLocalResumes(userId, next);
  return next;
}
