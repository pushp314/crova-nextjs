
import { useSyncExternalStore } from "react";

const MOBILE_BREAKPOINT = 768;

function subscribe(callback: () => void) {
  const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
  mql.addEventListener("change", callback);
  return () => mql.removeEventListener("change", callback);
}

function getSnapshot() {
  if (typeof window === "undefined") {
    return false; // Default to false on the server
  }
  return window.innerWidth < MOBILE_BREAKPOINT;
}

export function useIsMobile() {
  // useSyncExternalStore is the recommended way to subscribe to external,
  // mutable sources of data like browser APIs.
  return useSyncExternalStore(subscribe, getSnapshot, () => false);
}
