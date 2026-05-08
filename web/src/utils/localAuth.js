const USERS_KEY = "applyai_local_users";
const SESSION_KEY = "applyai_local_session";

function safeParse(value, fallback) {
  try {
    return JSON.parse(value ?? "");
  } catch {
    return fallback;
  }
}

export function getLocalUsers() {
  if (typeof window === "undefined") return [];
  return safeParse(window.localStorage.getItem(USERS_KEY), []);
}

export function setLocalUsers(users) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

export function getLocalSession() {
  if (typeof window === "undefined") return null;
  return safeParse(window.localStorage.getItem(SESSION_KEY), null);
}

export function setLocalSession(session) {
  if (typeof window === "undefined") return;
  if (!session) {
    window.localStorage.removeItem(SESSION_KEY);
  } else {
    window.localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  }
  window.dispatchEvent(new Event("applyai:auth-changed"));
}

export function signUpLocal({ email, password, name }) {
  const normalizedEmail = String(email || "")
    .trim()
    .toLowerCase();
  if (!normalizedEmail || !password) {
    return { error: "Email and password are required." };
  }

  const users = getLocalUsers();
  const exists = users.some((u) => u.email === normalizedEmail);
  if (exists) {
    return { error: "This email is already registered." };
  }

  const user = {
    id: `local_${Date.now()}`,
    email: normalizedEmail,
    name: name?.trim() || normalizedEmail.split("@")[0],
    password,
  };
  users.push(user);
  setLocalUsers(users);
  const sessionUser = { id: user.id, email: user.email, name: user.name };
  setLocalSession(sessionUser);
  return { user: sessionUser };
}

export function signInLocal({ email, password }) {
  const normalizedEmail = String(email || "")
    .trim()
    .toLowerCase();
  const users = getLocalUsers();
  const user = users.find(
    (u) => u.email === normalizedEmail && u.password === password,
  );
  if (!user) return { error: "Incorrect email or password." };
  const sessionUser = { id: user.id, email: user.email, name: user.name };
  setLocalSession(sessionUser);
  return { user: sessionUser };
}

export function signOutLocal() {
  setLocalSession(null);
}
