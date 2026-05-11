const USERS_KEY_NEW = "hireorbit_local_users";
const SESSION_KEY_NEW = "hireorbit_local_session";
const USERS_KEY_OLD = "applyai_local_users";
const SESSION_KEY_OLD = "applyai_local_session";

function safeParse(value, fallback) {
  try {
    return JSON.parse(value ?? "");
  } catch {
    return fallback;
  }
}

function migrateAuthKeys() {
  if (typeof window === "undefined") return;
  if (!window.localStorage.getItem(USERS_KEY_NEW) && window.localStorage.getItem(USERS_KEY_OLD)) {
    window.localStorage.setItem(
      USERS_KEY_NEW,
      window.localStorage.getItem(USERS_KEY_OLD),
    );
  }
  if (!window.localStorage.getItem(SESSION_KEY_NEW) && window.localStorage.getItem(SESSION_KEY_OLD)) {
    window.localStorage.setItem(
      SESSION_KEY_NEW,
      window.localStorage.getItem(SESSION_KEY_OLD),
    );
  }
}

export function getLocalUsers() {
  if (typeof window === "undefined") return [];
  migrateAuthKeys();
  return safeParse(window.localStorage.getItem(USERS_KEY_NEW), []);
}

export function setLocalUsers(users) {
  if (typeof window === "undefined") return;
  migrateAuthKeys();
  window.localStorage.setItem(USERS_KEY_NEW, JSON.stringify(users));
}

export function getLocalSession() {
  if (typeof window === "undefined") return null;
  migrateAuthKeys();
  return safeParse(window.localStorage.getItem(SESSION_KEY_NEW), null);
}

export function setLocalSession(session) {
  if (typeof window === "undefined") return;
  migrateAuthKeys();
  if (!session) {
    window.localStorage.removeItem(SESSION_KEY_NEW);
  } else {
    window.localStorage.setItem(SESSION_KEY_NEW, JSON.stringify(session));
  }
  window.dispatchEvent(new Event("hireorbit:auth-changed"));
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
