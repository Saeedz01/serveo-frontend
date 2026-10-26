export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3001/api";

export const AUTH_ENDPOINTS = {
  adminSignup: "/auth/admin/signup",
  adminLogin: "/auth/admin/login",
  seekerSignup: "/auth/seeker/signup",
  seekerLogin: "/auth/seeker/login",
  providerSignup: "/auth/provider/signup",
  providerLogin: "/auth/provider/login",
} as const;

export const SERVICE_ENDPOINTS = {
  published: "/services/published",
  mine: "/services/mine",
  root: "/services",
  byId: (id: string) => `/services/${id}`,
} as const;

export const SERVICE_CATEGORY_ENDPOINTS = {
  root: "/service-categories",
} as const;

export const BOOKING_ENDPOINTS = {
  root: "/bookings",
  mine: "/bookings/mine",
  providerMine: "/bookings/provider/mine",
  providerMarkSeen: "/bookings/provider/mark-seen",
  byId: (id: string) => `/bookings/${id}`,
  status: (id: string) => `/bookings/${id}/status`,
  withdraw: (id: string) => `/bookings/${id}/withdraw`,
} as const;

export const JOB_ENDPOINTS = {
  root: "/jobs",
  mine: "/jobs/mine",
  providerFeed: "/jobs/provider/feed",
  byId: (id: string) => `/jobs/${id}`,
  close: (id: string) => `/jobs/${id}/close`,
} as const;

export const BIDDING_ENDPOINTS = {
  root: "/bidding",
  forJob: (jobId: string) => `/bidding/job/${jobId}`,
  myBid: (jobId: string) => `/bidding/my-bid/${jobId}`,
  accept: (bidId: string) => `/bidding/${bidId}/accept`,
} as const;

export const NOTIFICATION_ENDPOINTS = {
  mine: "/notifications/mine",
  readAll: "/notifications/read-all",
  read: (id: string) => `/notifications/${id}/read`,
} as const;

export const MESSAGE_ENDPOINTS = {
  threads: "/messages/threads",
  threadsSearch: (q: string) =>
    `/messages/threads?q=${encodeURIComponent(q)}`,
  thread: (threadId: string) => `/messages/threads/${threadId}`,
  messages: (threadId: string, params?: { cursor?: string; limit?: number; q?: string }) => {
    const search = new URLSearchParams();
    if (params?.cursor) search.set("cursor", params.cursor);
    if (params?.limit) search.set("limit", String(params.limit));
    if (params?.q) search.set("q", params.q);
    const qs = search.toString();
    return `/messages/threads/${threadId}/messages${qs ? `?${qs}` : ""}`;
  },
  message: (threadId: string, messageId: string) =>
    `/messages/threads/${threadId}/messages/${messageId}`,
  delivered: (threadId: string) => `/messages/threads/${threadId}/delivered`,
  read: (threadId: string) => `/messages/threads/${threadId}/read`,
} as const;

export const TOKEN_ENDPOINTS = {
  me: "/tokens/me",
  unlock: "/tokens/unlock",
} as const;
