import { flushSync } from "react-dom";
import { bookingsForSeeker } from "@/lib/prototype-bookings";
import {
  clearCurrentSeeker as clearCurrentSeekerInStore,
  identifySeeker as identifySeekerInStore,
} from "@/lib/prototype-chat";
import {
  addNotification,
  markAllNotificationsRead,
  markNotificationRead,
  updateService as updateServiceInStore,
  updateServiceAvailability as updateServiceAvailabilityInStore,
  type UpdateServiceInput,
} from "@/lib/prototype-notifications";
import { updateProviderProfile as updateProviderProfileInStore } from "@/lib/prototype-profile";
import {
  acceptJobBid as acceptJobBidInStore,
  bidForProviderOnJob as bidForProviderOnJobInStore,
  bidsForJob as bidsForJobInStore,
  closeJobPost as closeJobPostInStore,
  createJobBid as createJobBidInStore,
  createJobPost as createJobPostInStore,
  getJobPost as getJobPostInStore,
  jobPostsForSeeker as jobPostsForSeekerInStore,
  liveBidForProviderOnJob as liveBidForProviderOnJobInStore,
  openJobPosts as openJobPostsInStore,
  visibleBidsForJob as visibleBidsForJobInStore,
} from "@/lib/prototype-jobs";
import {
  canReviewBooking as canReviewBookingInStore,
  ratingForProvider as ratingForProviderInStore,
  ratingForService as ratingForServiceInStore,
  reviewForBooking as reviewForBookingInStore,
  reviewsForService as reviewsForServiceInStore,
  submitReview as submitReviewInStore,
} from "@/lib/prototype-reviews";
import {
  createBooking as createBookingInStore,
  createService as createServiceInStore,
  loginAdmin as loginAdminInStore,
  loginProvider as loginProviderInStore,
  logoutAdmin as logoutAdminInStore,
  registerProvider as registerProviderInStore,
  removeService as removeServiceInStore,
  setBookingStatus,
  setCurrentProvider as setCurrentProviderInStore,
  setProviderStatus,
  setServiceStatus,
  verifyProviderAndPublishDrafts,
} from "@/lib/prototype-store";
import type {
  PrototypeJobBid,
  PrototypeJobPost,
  PrototypeProvider,
  PrototypeReview,
  PrototypeSeeker,
  PrototypeState,
} from "@/lib/prototype-types";
import type {
  AcceptJobBidOutcome,
  CloseJobPostOutcome,
  CreateJobBidOutcome,
  CreateJobPostOutcome,
  ProviderLoginOutcome,
  PrototypeContextValue,
  SubmitReviewOutcome,
  UpdateProfileOutcome,
} from "./prototype-context";

type Commit = (updater: (prev: PrototypeState) => PrototypeState) => void;

export function buildPrototypeValue(input: {
  ready: boolean;
  state: PrototypeState;
  currentProvider: PrototypeProvider | null;
  currentSeeker: PrototypeSeeker | null;
  commit: Commit;
}): PrototypeContextValue {
  const { ready, state, currentProvider, currentSeeker, commit } = input;

  return {
    ready,
    state,
    currentProvider,
    currentSeeker,
    adminAuthenticated: state.adminAuthenticated,
    commit,
    registerProvider: (registerInput) => {
      let created!: PrototypeProvider;
      flushSync(() => {
        commit((prev) => {
          const next = registerProviderInStore(prev, registerInput);
          created = next.providers[0];
          return next;
        });
      });
      return created;
    },
    loginProvider: (phone, password) => {
      let outcome: ProviderLoginOutcome = { ok: false, reason: "not_found" };
      flushSync(() => {
        commit((prev) => {
          const result = loginProviderInStore(prev, phone, password);
          if (result.ok) {
            outcome = { ok: true, provider: result.provider };
            return result.state;
          }
          outcome = { ok: false, reason: result.reason };
          return result.state;
        });
      });
      return outcome;
    },
    loginAdmin: (email, password) => {
      let outcome: { ok: true } | { ok: false; reason: "bad_credentials" } = {
        ok: false,
        reason: "bad_credentials",
      };
      flushSync(() => {
        commit((prev) => {
          const result = loginAdminInStore(prev, email, password);
          if (result.ok) {
            outcome = { ok: true };
            return result.state;
          }
          outcome = { ok: false, reason: result.reason };
          return result.state;
        });
      });
      return outcome;
    },
    logoutAdmin: () => commit((prev) => logoutAdminInStore(prev)),
    identifySeeker: (seekerInput) => {
      let seeker!: PrototypeSeeker;
      flushSync(() => {
        commit((prev) => {
          const result = identifySeekerInStore(prev, seekerInput);
          seeker = result.seeker;
          return result.state;
        });
      });
      return seeker;
    },
    clearSeekerSession: () =>
      commit((prev) => clearCurrentSeekerInStore(prev)),
    updateProviderProfile: (profileInput) => {
      let outcome: UpdateProfileOutcome = { ok: false, reason: "not_found" };
      if (!state.currentProviderId) return outcome;
      const providerId = state.currentProviderId;
      commit((prev) => {
        const result = updateProviderProfileInStore(
          prev,
          providerId,
          profileInput,
        );
        if (result.ok) {
          outcome = { ok: true, provider: result.provider };
          return result.state;
        }
        outcome = { ok: false, reason: result.reason };
        return result.state;
      });
      return outcome;
    },
    verifyProvider: (providerId) =>
      commit((prev) => verifyProviderAndPublishDrafts(prev, providerId)),
    rejectProvider: (providerId) =>
      commit((prev) => setProviderStatus(prev, providerId, "rejected")),
    createService: (serviceInput) => {
      commit((prev) => {
        const provider = prev.providers.find(
          (item) => item.id === serviceInput.providerId,
        );
        const status =
          provider?.status === "verified" ? serviceInput.status : "draft";
        return createServiceInStore(prev, { ...serviceInput, status });
      });
    },
    publishService: (serviceId) => {
      commit((prev) => {
        const service = prev.services.find((item) => item.id === serviceId);
        const provider = prev.providers.find(
          (item) => item.id === service?.providerId,
        );
        if (provider?.status !== "verified") return prev;
        return setServiceStatus(prev, serviceId, "published");
      });
    },
    unpublishService: (serviceId) => {
      commit((prev) => {
        const service = prev.services.find((item) => item.id === serviceId);
        if (!service || service.status !== "published") return prev;
        return setServiceStatus(prev, serviceId, "draft");
      });
    },
    suspendService: (serviceId) =>
      commit((prev) => setServiceStatus(prev, serviceId, "suspended")),
    restoreService: (serviceId) =>
      commit((prev) => setServiceStatus(prev, serviceId, "published")),
    removeService: (serviceId) =>
      commit((prev) => removeServiceInStore(prev, serviceId)),
    createBooking: (bookingInput) => {
      commit((prev) => {
        const identified = identifySeekerInStore(prev, {
          name: bookingInput.seekerName,
          phone: bookingInput.seekerPhone,
        });
        const withBooking = createBookingInStore(identified.state, {
          ...bookingInput,
          seekerId: identified.seeker.id,
        });
        const created = withBooking.bookings[0];
        return addNotification(withBooking, {
          providerId: bookingInput.providerId,
          type: "booking_request",
          title: "New booking request",
          body: `${bookingInput.seekerName.trim()} requested ${bookingInput.serviceTitle} for ${new Date(bookingInput.requestedAt).toLocaleString()}.`,
          href: created
            ? `/provider/bookings/${created.id}`
            : "/provider/bookings",
        });
      });
    },
    acceptBooking: (bookingId) =>
      commit((prev) => setBookingStatus(prev, bookingId, "accepted")),
    negotiateBooking: (bookingId) =>
      commit((prev) => setBookingStatus(prev, bookingId, "negotiating")),
    declineBooking: (bookingId) =>
      commit((prev) => setBookingStatus(prev, bookingId, "declined")),
    submitReview: (reviewInput): SubmitReviewOutcome => {
      let created: PrototypeReview | null = null;
      let error: string | undefined;
      flushSync(() => {
        commit((prev) => {
          const result = submitReviewInStore(prev, reviewInput);
          created = result.review;
          error = result.error;
          return result.state;
        });
      });
      if (!created) {
        return { ok: false, reason: error ?? "Could not submit review." };
      }
      return { ok: true, review: created };
    },
    createJobPost: (jobInput): CreateJobPostOutcome => {
      let created: PrototypeJobPost | null = null;
      flushSync(() => {
        commit((prev) => {
          const identified = identifySeekerInStore(prev, {
            name: jobInput.seekerName,
            phone: jobInput.seekerPhone,
          });
          const result = createJobPostInStore(identified.state, {
            ...jobInput,
            seekerId: identified.seeker.id,
          });
          created = result.job;
          return result.state;
        });
      });
      if (!created) {
        return { ok: false, reason: "Could not create job post." };
      }
      return { ok: true, job: created };
    },
    createJobBid: (bidInput): CreateJobBidOutcome => {
      let created: PrototypeJobBid | null = null;
      let error: string | undefined;
      flushSync(() => {
        commit((prev) => {
          const result = createJobBidInStore(prev, bidInput);
          created = result.bid;
          error = result.error;
          return result.state;
        });
      });
      if (!created) {
        return { ok: false, reason: error ?? "Could not place bid." };
      }
      return { ok: true, bid: created };
    },
    acceptJobBid: (jobId, bidId): AcceptJobBidOutcome => {
      let error: string | undefined;
      flushSync(() => {
        commit((prev) => {
          const result = acceptJobBidInStore(prev, jobId, bidId);
          error = result.error;
          return result.state;
        });
      });
      if (error) return { ok: false, reason: error };
      return { ok: true };
    },
    closeJobPost: (jobId): CloseJobPostOutcome => {
      let error: string | undefined;
      flushSync(() => {
        commit((prev) => {
          const result = closeJobPostInStore(prev, jobId);
          error = result.error;
          return result.state;
        });
      });
      if (error) return { ok: false, reason: error };
      return { ok: true };
    },
    updateServiceAvailability: (serviceId, availability) =>
      commit((prev) =>
        updateServiceAvailabilityInStore(prev, serviceId, availability),
      ),
    updateService: (serviceId, updateInput: UpdateServiceInput) =>
      commit((prev) => updateServiceInStore(prev, serviceId, updateInput)),
    markNotificationRead: (notificationId) =>
      commit((prev) => markNotificationRead(prev, notificationId)),
    markAllNotificationsRead: () => {
      if (!state.currentProviderId) return;
      const providerId = state.currentProviderId;
      commit((prev) => markAllNotificationsRead(prev, providerId));
    },
    switchProvider: (providerId) =>
      commit((prev) => setCurrentProviderInStore(prev, providerId)),
    logout: () => commit((prev) => setCurrentProviderInStore(prev, null)),
    servicesForProvider: (providerId) =>
      state.services.filter((service) => service.providerId === providerId),
    bookingsForProvider: (providerId) =>
      state.bookings.filter((booking) => booking.providerId === providerId),
    bookingsForCurrentSeeker: () => {
      if (!currentSeeker) return [];
      return bookingsForSeeker(state, currentSeeker.id, currentSeeker.phone);
    },
    notificationsForProvider: (providerId) =>
      (state.notifications ?? []).filter(
        (item) => item.providerId === providerId,
      ),
    getPublishedService: (serviceId) =>
      state.services.find(
        (service) =>
          service.id === serviceId && service.status === "published",
      ),
    reviewsForService: (serviceId) => reviewsForServiceInStore(state, serviceId),
    ratingForProvider: (providerId) =>
      ratingForProviderInStore(state, providerId),
    ratingForService: (serviceId) => ratingForServiceInStore(state, serviceId),
    reviewForBooking: (bookingId) => reviewForBookingInStore(state, bookingId),
    canReviewBooking: (booking) => canReviewBookingInStore(state, booking),
    openJobPosts: () => openJobPostsInStore(state),
    jobPostsForCurrentSeeker: () => {
      if (!currentSeeker) return [];
      return jobPostsForSeekerInStore(
        state,
        currentSeeker.id,
        currentSeeker.phone,
      );
    },
    getJobPost: (jobId) => getJobPostInStore(state, jobId),
    bidsForJob: (jobId) => bidsForJobInStore(state, jobId),
    visibleBidsForJob: (jobId) => visibleBidsForJobInStore(state, jobId),
    bidForProviderOnJob: (jobId, providerId) =>
      bidForProviderOnJobInStore(state, jobId, providerId),
    liveBidForProviderOnJob: (jobId, providerId) =>
      liveBidForProviderOnJobInStore(state, jobId, providerId),
  };
}
