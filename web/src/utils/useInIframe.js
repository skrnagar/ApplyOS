import { useSyncExternalStore } from "react";

/** True when running inside a parent iframe (Create preview / sandbox). */
export function useInIframe() {
  return useSyncExternalStore(
    () => () => {},
    () => {
      try {
        return window.parent !== window;
      } catch {
        return true;
      }
    },
    () => false,
  );
}
