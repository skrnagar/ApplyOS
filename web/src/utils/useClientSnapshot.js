import { useSyncExternalStore } from "react";
import { getLocalSession } from "./localAuth";

function subscribeResize(onStoreChange) {
  window.addEventListener("resize", onStoreChange);
  return () => window.removeEventListener("resize", onStoreChange);
}

/** Viewport under 768px; false on server and during hydration, then updates on client. */
export function useIsMobile() {
  return useSyncExternalStore(
    subscribeResize,
    () => window.innerWidth < 768,
    () => false,
  );
}

/**
 * Read a client-only value (e.g. localStorage) without SSR mismatch.
 * Server and first hydrated paint use `serverValue` (default null).
 */
export function useClientSnapshot(readValue, serverValue = null) {
  return useSyncExternalStore(
    () => () => {},
    readValue,
    () => serverValue,
  );
}

function subscribeLocalAuth(onStoreChange) {
  window.addEventListener("hireorbit:auth-changed", onStoreChange);
  window.addEventListener("applyai:auth-changed", onStoreChange);
  return () => {
    window.removeEventListener("hireorbit:auth-changed", onStoreChange);
    window.removeEventListener("applyai:auth-changed", onStoreChange);
  };
}

/** Local demo session from storage; null on server / during hydration. */
export function useLocalSession() {
  return useSyncExternalStore(subscribeLocalAuth, getLocalSession, () => null);
}
