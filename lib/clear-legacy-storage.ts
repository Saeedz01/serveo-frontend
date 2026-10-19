/**
 * Keys from older builds that are no longer used.
 * Auth keys (servio-access-token / servio-auth-user) are intentionally kept —
 * they persist login until the user logs out.
 */
const LEGACY_KEYS = [
  "serveo-prototype",
  "servio-guest-mode",
  "servio-dev-credentials",
] as const;

/** Remove leftover non-auth browser storage from previous app versions. */
export function clearLegacyLocalStorage() {
  if (typeof window === "undefined") return;
  for (const key of LEGACY_KEYS) {
    window.localStorage.removeItem(key);
  }
}
