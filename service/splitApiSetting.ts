import {
  createApi,
  fetchBaseQuery,
  type BaseQueryFn,
  type FetchArgs,
  type FetchBaseQueryError,
} from "@reduxjs/toolkit/query/react";
import { API_BASE_URL } from "./endpoint";

export const ACCESS_TOKEN_KEY = "servio-access-token";

/** In-memory JWT; mirrored to localStorage so login survives navigation. */
let accessToken: string | null = null;
let tokenHydrated = false;

function readStoredToken(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(ACCESS_TOKEN_KEY);
  } catch {
    return null;
  }
}

/** Load token from localStorage once (safe to call repeatedly). */
export function hydrateAccessToken(): string | null {
  if (typeof window === "undefined") return accessToken;
  if (!tokenHydrated) {
    accessToken = readStoredToken();
    tokenHydrated = true;
  }
  return accessToken;
}

export function getAccessToken(): string | null {
  if (!tokenHydrated && typeof window !== "undefined") {
    return hydrateAccessToken();
  }
  return accessToken;
}

export function setAccessToken(token: string | null) {
  accessToken = token;
  tokenHydrated = true;
  if (typeof window === "undefined") return;
  try {
    if (token) {
      window.localStorage.setItem(ACCESS_TOKEN_KEY, token);
    } else {
      window.localStorage.removeItem(ACCESS_TOKEN_KEY);
    }
  } catch {
    // Ignore quota / private-mode failures; in-memory token still works.
  }
}

const rawBaseQuery = fetchBaseQuery({
  baseUrl: API_BASE_URL,
  prepareHeaders: (headers) => {
    const token = getAccessToken();
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
    headers.set("Content-Type", "application/json");
    return headers;
  },
});

function requestUrl(args: string | FetchArgs): string {
  return typeof args === "string" ? args : args.url;
}

function isPublicAuthRequest(url: string): boolean {
  return (
    url.includes("/auth/login") ||
    url.includes("/auth/signup") ||
    url.includes("/auth/provider/login") ||
    url.includes("/auth/provider/signup") ||
    url.includes("/auth/seeker/login") ||
    url.includes("/auth/seeker/signup") ||
    url.includes("/auth/admin/login")
  );
}

const baseQueryWithAuth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  const result = await rawBaseQuery(args, api, extraOptions);
  if (result.error?.status === 401 && !isPublicAuthRequest(requestUrl(args))) {
    // Dynamic import avoids a circular dependency with auth-session.
    void import("./auth-session").then(({ redirectToLogin }) => {
      redirectToLogin();
    });
  }
  return result;
};

/**
 * Empty split API — feature APIs inject endpoints into this instance.
 */
export const splitApi = createApi({
  reducerPath: "splitApi",
  baseQuery: baseQueryWithAuth,
  tagTypes: [
    "Auth",
    "Service",
    "ServiceCategory",
    "ServiceCity",
    "Booking",
    "Job",
    "Bidding",
    "Notification",
    "Message",
    "Token",
    "Review",
  ],
  endpoints: () => ({}),
});
