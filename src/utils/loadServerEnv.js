/**
 * Loads `.env` / `.env.local` into `process.env` for the Hono API server in local dev.
 * On Vercel, env vars are injected at deploy time — do not import Vite (devDependency) in the server bundle.
 */
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

let loaded = false;

function parseEnvFile(content) {
  const env = {};
  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    env[key] = value;
  }
  return env;
}

export function loadServerEnv() {
  if (loaded) return;
  loaded = true;

  // Vercel injects env at deploy time. Local `npm run start` still needs .env.local.
  if (process.env.VERCEL === "1") {
    return;
  }

  const cwd = process.cwd();
  for (const file of [".env", ".env.local", ".env.development", ".env.development.local"]) {
    const path = join(cwd, file);
    if (!existsSync(path)) continue;
    try {
      const parsed = parseEnvFile(readFileSync(path, "utf8"));
      for (const [key, value] of Object.entries(parsed)) {
        if (value !== undefined && value !== "") {
          process.env[key] ??= value;
        }
      }
    } catch (error) {
      console.warn(`loadServerEnv: could not read ${file}:`, error);
    }
  }
}

loadServerEnv();
