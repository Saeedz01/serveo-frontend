import type { PrototypeState } from "./prototype-types";

/** Empty in-memory starting state — no browser persistence. */
export const seedState = (): PrototypeState => ({
  currentProviderId: null,
  currentSeekerId: null,
  adminAuthenticated: false,
  seekers: [],
  chatThreads: [],
  chatMessages: [],
  chatReadStates: [],
  providers: [],
  services: [],
  bookings: [],
  reviews: [],
  jobPosts: [],
  jobBids: [],
  notifications: [],
});
