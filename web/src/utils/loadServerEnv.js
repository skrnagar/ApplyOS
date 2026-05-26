/**
 * Ensures `.env` / `.env.local` vars are on `process.env` for the Hono API server.
 * Vite only auto-injects `NEXT_PUBLIC_*` to the client; server routes need this in dev.
 */
import { loadEnv } from "vite";

let loaded = false;

export function loadServerEnv() {
  if (loaded) return;
  loaded = true;

  const mode = process.env.NODE_ENV === "production" ? "production" : "development";
  const env = loadEnv(mode, process.cwd(), "");

  for (const [key, value] of Object.entries(env)) {
    if (value !== undefined && value !== "") {
      process.env[key] ??= value;
    }
  }
}

// Run when this module is first imported (before API handlers load env-dependent code).
loadServerEnv();
