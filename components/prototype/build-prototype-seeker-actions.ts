import { flushSync } from "react-dom";
import {
  closeJobPost as closeJobPostInStore,
  createJobPost as createJobPostInStore,
  getJobPost as getJobPostInStore,
} from "@/lib/prototype-jobs";
import {
  clearCurrentSeeker as clearCurrentSeekerInStore,
  identifySeeker as identifySeekerInStore,
  loginSeeker as loginSeekerInStore,
  registerSeeker as registerSeekerInStore,
  resolveSeekerForAction,
} from "@/lib/prototype-seeker-auth";
import { createBooking as createBookingInStore } from "@/lib/prototype-store";
import type {
  PrototypeJobPost,
  PrototypeSeeker,
  PrototypeState,
} from "@/lib/prototype-types";
import type {
  AcceptJobBidOutcome,
  CloseJobPostOutcome,
  CreateJobBidOutcome,
  CreateJobPostOutcome,
  PrototypeContextValue,
  SeekerLoginOutcome,
  SeekerRegisterOutcome,
} from "./prototype-context";

type Commit = (updater: (prev: PrototypeState) => PrototypeState) => void;

type SeekerActionSlice = Pick<
  PrototypeContextValue,
  | "identifySeeker"
  | "registerSeeker"
  | "loginSeeker"
  | "clearSeekerSession"
  | "createBooking"
  | "createJobPost"
  | "createJobBid"
  | "acceptJobBid"
  | "closeJobPost"
  | "bookingsForCurrentSeeker"
  | "openJobPosts"
  | "jobPostsForCurrentSeeker"
  | "getJobPost"
  | "bidsForJob"
  | "visibleBidsForJob"
  | "bidForProviderOnJob"
  | "liveBidForProviderOnJob"
>;

export function buildPrototypeSeekerActions(input: {
  state: PrototypeState;
  currentSeeker: PrototypeSeeker | null;
  commit: Commit;
}): SeekerActionSlice {
  const { state, currentSeeker, commit } = input;

  return {
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
    registerSeeker: (registerInput) => {
      let outcome: SeekerRegisterOutcome = { ok: false, reason: "invalid" };
      flushSync(() => {
        commit((prev) => {
          const result = registerSeekerInStore(prev, registerInput);
          if (result.ok) {
            outcome = { ok: true, seeker: result.seeker };
            return result.state;
          }
          outcome = { ok: false, reason: result.reason };
          return result.state;
        });
      });
      return outcome;
    },
    loginSeeker: (phone, password) => {
      let outcome: SeekerLoginOutcome = { ok: false, reason: "not_found" };
      flushSync(() => {
        commit((prev) => {
          const result = loginSeekerInStore(prev, phone, password);
          if (result.ok) {
            outcome = { ok: true, seeker: result.seeker };
            return result.state;
          }
          outcome = { ok: false, reason: result.reason };
          return result.state;
        });
      });
      return outcome;
    },
    clearSeekerSession: () =>
      commit((prev) => clearCurrentSeekerInStore(prev)),
    createBooking: (bookingInput) => {
      // Bookings persist in Postgres. Keep a transient in-memory copy for
      // legacy provider prototype screens.
      commit((prev) => {
        const resolved = resolveSeekerForAction(prev, {
          name: bookingInput.seekerName,
          phone: bookingInput.seekerPhone,
        });
        return createBookingInStore(resolved.state, {
          ...bookingInput,
          seekerId: resolved.seeker.id,
        });
      });
    },
    createJobPost: (jobInput): CreateJobPostOutcome => {
      let created: PrototypeJobPost | null = null;
      flushSync(() => {
        commit((prev) => {
          const resolved = resolveSeekerForAction(prev, {
            name: jobInput.seekerName,
            phone: jobInput.seekerPhone,
          });
          const result = createJobPostInStore(resolved.state, {
            ...jobInput,
            seekerId: resolved.seeker.id,
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
    // Bids persist in Postgres via /bidding — prototype store is unused.
    createJobBid: (): CreateJobBidOutcome => ({
      ok: false,
      reason: "Bids are saved on the server.",
    }),
    acceptJobBid: (): AcceptJobBidOutcome => ({
      ok: false,
      reason: "Bid acceptance is handled on the server.",
    }),
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
    bookingsForCurrentSeeker: () => {
      // Seeker booking tracking is loaded from the API, not prototype state.
      return [];
    },
    openJobPosts: () => [],
    jobPostsForCurrentSeeker: () => [],
    getJobPost: (jobId) => getJobPostInStore(state, jobId),
    bidsForJob: () => [],
    visibleBidsForJob: () => [],
    bidForProviderOnJob: () => undefined,
    liveBidForProviderOnJob: () => undefined,
  };
}
