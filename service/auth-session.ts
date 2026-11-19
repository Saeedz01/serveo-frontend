import type { AuthResponse, AuthRole, AuthUser } from "./api/types";
import {
  getAccessToken,
  hydrateAccessToken,
  setAccessToken,
} from "./splitApiSetting";

export const AUTH_USER_KEY = "servio-auth-user";

/** In-memory auth user; mirrored to localStorage until logout. */
let authUser: AuthUser | null = null;
let userHydrated = false;
let loginRedirectInFlight = false;

/** Decode JWT payload without verifying signature (client expiry gate only). */
function readJwtExpiryMs(token: string): number | null {
  try {
    const parts = token.split(".");
    if (parts.length < 2 || !parts[1]) return null;
    const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), "=");
    const json =
      typeof atob === "function"
        ? atob(padded)
        : Buffer.from(padded, "base64").toString("utf8");
    const payload = JSON.parse(json) as { exp?: unknown };
    return typeof payload.exp === "number" ? payload.exp * 1000 : null;
  } catch {
    return null;
  }
}

export function isAccessTokenExpired(token: string | null = getAccessToken()): boolean {
  if (!token) return true;
  const expiresAt = readJwtExpiryMs(token);
  if (expiresAt == null) return false;
  // Small skew so we don't race the server clock.
  return Date.now() >= expiresAt - 5_000;
}

export function getLoginPathForRole(
  role?: AuthRole | null,
  pathname?: string | null,
): string {
  const path = pathname ?? (typeof window !== "undefined" ? window.location.pathname : "");
  if (path.startsWith("/provider")) return "/provider/login";
  if (path.startsWith("/admin")) return "/admin/login";
  if (
    path.startsWith("/seeker") ||
    path.startsWith("/requests") ||
    path.startsWith("/jobs")
  ) {
    return "/seeker/login";
  }
  if (role === "PROVIDER") return "/provider/login";
  if (role === "ADMIN") return "/admin/login";
  if (role === "SEEKER") return "/seeker/login";
  return "/seeker/login";
}

/**
 * Clear local auth and send the browser to the matching login page.
 * Safe to call repeatedly; skips when already on an auth route.
 */
export function redirectToLogin(options?: {
  role?: AuthRole | null;
  pathname?: string | null;
}): void {
  if (typeof window === "undefined" || loginRedirectInFlight) return;
  const path = options?.pathname ?? window.location.pathname;
  if (
    path.endsWith("/login") ||
    path.endsWith("/signup") ||
    path.includes("/login?") ||
    path.includes("/signup?")
  ) {
    return;
  }

  const role = options?.role ?? authUser?.role ?? null;
  const loginPath = getLoginPathForRole(role, path);
  loginRedirectInFlight = true;
  clearAuthSession();
  window.location.assign(loginPath);
}

function readStoredUser(): AuthUser | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(AUTH_USER_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as AuthUser;
    if (!parsed?.id || !parsed?.role) return null;
    return parsed;
  } catch {
    return null;
  }
}

function writeStoredUser(user: AuthUser | null) {
  if (typeof window === "undefined") return;
  try {
    if (user) {
      window.localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
    } else {
      window.localStorage.removeItem(AUTH_USER_KEY);
    }
  } catch {
    // Ignore quota / private-mode failures.
  }
}

/** Restore token + user from localStorage (idempotent). Drops expired tokens. */
export function hydrateAuthSession(): AuthUser | null {
  const token = hydrateAccessToken();
  if (!userHydrated) {
    authUser = readStoredUser();
    userHydrated = true;
  }
  if (token && isAccessTokenExpired(token)) {
    clearAuthSession();
    return null;
  }
  if (!token && authUser) {
    clearAuthSession();
    return null;
  }
  return authUser;
}

/** True when a non-expired token and matching role are present. */
export function hasValidAuthSession(expectedRole?: AuthRole): boolean {
  const user = getStoredAuthUser();
  const token = getAccessToken();
  if (!user || !token || isAccessTokenExpired(token)) return false;
  if (expectedRole && user.role !== expectedRole) return false;
  return true;
}

/** Drop an expired local session if present. Safe to call from effects. */
export function clearExpiredAuthSession(): boolean {
  const token = getAccessToken();
  if (token && isAccessTokenExpired(token)) {
    clearAuthSession();
    return true;
  }
  if (!token && getStoredAuthUser()) {
    clearAuthSession();
    return true;
  }
  return false;
}

export function persistAuthSession(response: AuthResponse) {
  setAccessToken(response.accessToken);
  authUser = response.user;
  userHydrated = true;
  writeStoredUser(response.user);
}

export function clearAuthSession() {
  setAccessToken(null);
  authUser = null;
  userHydrated = true;
  writeStoredUser(null);
}

export function getStoredAuthUser(): AuthUser | null {
  if (!userHydrated && typeof window !== "undefined") {
    return hydrateAuthSession();
  }
  return authUser;
}

export function getApiErrorMessage(error: unknown, fallback: string): string {
  if (
    error &&
    typeof error === "object" &&
    "data" in error &&
    error.data &&
    typeof error.data === "object"
  ) {
    const data = error.data as { message?: string | string[] };
    if (Array.isArray(data.message)) {
      return data.message.join(" ");
    }
    if (typeof data.message === "string" && data.message.trim()) {
      return data.message;
    }
  }
  if (error && typeof error === "object" && "error" in error) {
    const status = "status" in error ? String(error.status) : "";
    if (status === "FETCH_ERROR") {
      return "Cannot reach the server. Is the backend running?";
    }
  }
  return fallback;
}
