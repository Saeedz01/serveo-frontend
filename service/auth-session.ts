import type { AuthResponse, AuthUser } from "./api/types";
import { hydrateAccessToken, setAccessToken } from "./splitApiSetting";

export const AUTH_USER_KEY = "servio-auth-user";

/** In-memory auth user; mirrored to localStorage until logout. */
let authUser: AuthUser | null = null;
let userHydrated = false;

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

/** Restore token + user from localStorage (idempotent). */
export function hydrateAuthSession(): AuthUser | null {
  hydrateAccessToken();
  if (!userHydrated) {
    authUser = readStoredUser();
    userHydrated = true;
  }
  return authUser;
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
