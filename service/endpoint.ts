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
  guestLookup: "/bookings/guest-lookup",
  providerMine: "/bookings/provider/mine",
  providerMarkSeen: "/bookings/provider/mark-seen",
  byId: (id: string) => `/bookings/${id}`,
  status: (id: string) => `/bookings/${id}/status`,
  withdraw: (id: string) => `/bookings/${id}/withdraw`,
} as const;

export const JOB_ENDPOINTS = {
  root: "/jobs",
  mine: "/jobs/mine",
  guestLookup: "/jobs/guest-lookup",
  providerFeed: "/jobs/provider/feed",
  byId: (id: string) => `/jobs/${id}`,
  close: (id: string) => `/jobs/${id}/close`,
} as const;

export const BIDDING_ENDPOINTS = {
  root: "/bidding",
  forJob: (jobId: string) => `/bidding/job/${jobId}`,
  guestForJob: (jobId: string) => `/bidding/job/${jobId}/guest-lookup`,
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
  thread: (threadId: string) => `/messages/threads/${threadId}`,
  messages: (threadId: string) => `/messages/threads/${threadId}/messages`,
  read: (threadId: string) => `/messages/threads/${threadId}/read`,
} as const;
