import {
  bidForProviderOnJob,
  isBidLive,
} from "./prototype-job-bids";
import { addNotification } from "./prototype-notifications";
import {
  createBooking,
  setBookingStatus,
} from "./prototype-store";
import type {
  CreateJobBidInput,
  CreateJobPostInput,
  PrototypeJobBid,
  PrototypeJobPost,
  PrototypeState,
} from "./prototype-types";

export {
  JOB_BID_VISIBLE_MS,
  bidExpiresAtMs,
  bidForProviderOnJob,
  bidRemainingMs,
  bidsForJob,
  isBidLive,
  liveBidForProviderOnJob,
  visibleBidsForJob,
} from "./prototype-job-bids";

function createId(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 9)}`;
}

export function openJobPosts(state: PrototypeState): PrototypeJobPost[] {
  // Closed and awarded jobs never appear on provider/seeker open boards.
  return (state.jobPosts ?? [])
    .filter((job) => job.status === "open")
    .slice()
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function jobPostsForSeeker(
  state: PrototypeState,
  seekerId: string,
  seekerPhone?: string,
): PrototypeJobPost[] {
  const phoneKey = (seekerPhone ?? "").replace(/[^\d+]/g, "");
  return (state.jobPosts ?? [])
    .filter((job) => {
      if (job.seekerId && job.seekerId === seekerId) return true;
      if (phoneKey && job.seekerPhone.replace(/[^\d+]/g, "") === phoneKey) {
        return true;
      }
      return false;
    })
    .slice()
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function getJobPost(
  state: PrototypeState,
  jobId: string,
): PrototypeJobPost | undefined {
  return (state.jobPosts ?? []).find((job) => job.id === jobId);
}

export function createJobPost(
  state: PrototypeState,
  input: CreateJobPostInput,
): { state: PrototypeState; job: PrototypeJobPost } {
  const job: PrototypeJobPost = {
    id: createId("job"),
    seekerId: input.seekerId,
    seekerName: input.seekerName.trim(),
    seekerPhone: input.seekerPhone.trim(),
    title: input.title.trim(),
    description: input.description.trim(),
    location: {
      address: input.location.address.trim(),
      lat: input.location.lat,
      lng: input.location.lng,
    },
    status: "open",
    createdAt: new Date().toISOString(),
  };

  let next: PrototypeState = {
    ...state,
    jobPosts: [job, ...(state.jobPosts ?? [])],
  };

  const verified = (state.providers ?? []).filter(
    (provider) => provider.status === "verified",
  );
  for (const provider of verified) {
    next = addNotification(next, {
      providerId: provider.id,
      type: "job_post",
      title: "New job post",
      body: `${job.seekerName} posted “${job.title}”. Bid if you can take it.`,
      href: `/provider/jobs/${job.id}`,
    });
  }

  return { state: next, job };
}

export function createJobBid(
  state: PrototypeState,
  input: CreateJobBidInput,
): { state: PrototypeState; bid: PrototypeJobBid | null; error?: string } {
  const job = getJobPost(state, input.jobId);
  if (!job) {
    return { state, bid: null, error: "Job not found." };
  }
  if (job.status !== "open") {
    return { state, bid: null, error: "This job is no longer open for bids." };
  }

  const provider = (state.providers ?? []).find(
    (item) => item.id === input.providerId,
  );
  if (!provider || provider.status !== "verified") {
    return {
      state,
      bid: null,
      error: "Only verified providers can bid on jobs.",
    };
  }

  const existing = bidForProviderOnJob(state, input.jobId, input.providerId);
  if (existing?.status === "accepted") {
    return {
      state,
      bid: null,
      error: "Your bid on this job was already accepted.",
    };
  }
  if (existing && isBidLive(existing)) {
    return {
      state,
      bid: null,
      error: "You already placed a bid on this job.",
    };
  }

  const amount = Number(input.amount);
  if (!Number.isFinite(amount) || amount <= 0) {
    return { state, bid: null, error: "Enter a valid bid amount." };
  }

  const bid: PrototypeJobBid = {
    id: createId("bid"),
    jobId: input.jobId,
    providerId: input.providerId,
    providerName: input.providerName.trim() || provider.name,
    amount,
    note: input.note?.trim() ?? "",
    status: "pending",
    createdAt: new Date().toISOString(),
  };

  const withoutStale = (state.jobBids ?? []).filter(
    (item) =>
      !(
        item.jobId === input.jobId &&
        item.providerId === input.providerId &&
        item.status === "pending"
      ),
  );

  return {
    bid,
    state: {
      ...state,
      jobBids: [bid, ...withoutStale],
    },
  };
}

export function closeJobPost(
  state: PrototypeState,
  jobId: string,
): { state: PrototypeState; error?: string } {
  const job = getJobPost(state, jobId);
  if (!job) return { state, error: "Job not found." };
  if (job.status !== "open") {
    return { state, error: "This job is already awarded or closed." };
  }

  return {
    state: {
      ...state,
      jobPosts: (state.jobPosts ?? []).map((item) =>
        item.id === jobId ? { ...item, status: "closed" as const } : item,
      ),
      jobBids: (state.jobBids ?? []).map((item) =>
        item.jobId === jobId && item.status === "pending"
          ? { ...item, status: "rejected" as const }
          : item,
      ),
    },
  };
}

export function acceptJobBid(
  state: PrototypeState,
  jobId: string,
  bidId: string,
): { state: PrototypeState; error?: string } {
  const job = getJobPost(state, jobId);
  if (!job) return { state, error: "Job not found." };
  if (job.status !== "open") {
    return { state, error: "This job is already awarded or closed." };
  }

  const bid = (state.jobBids ?? []).find(
    (item) => item.id === bidId && item.jobId === jobId,
  );
  if (!bid || bid.status !== "pending") {
    return { state, error: "Bid not found or not available." };
  }
  if (!isBidLive(bid)) {
    return {
      state: {
        ...state,
        jobBids: (state.jobBids ?? []).map((item) =>
          item.id === bidId ? { ...item, status: "rejected" as const } : item,
        ),
      },
      error: "This bid expired and can no longer be accepted.",
    };
  }

  const requestedAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
  let next = createBooking(state, {
    serviceId: `job-post-${job.id}`,
    providerId: bid.providerId,
    serviceTitle: job.title,
    seekerName: job.seekerName,
    seekerPhone: job.seekerPhone,
    seekerId: job.seekerId,
    location: job.location,
    requestedAt,
    note: bid.note
      ? `Awarded from job bid ($${bid.amount}). ${bid.note}`
      : `Awarded from job bid ($${bid.amount}).`,
  });

  const createdBooking = next.bookings[0];
  if (createdBooking) {
    next = setBookingStatus(next, createdBooking.id, "accepted");
  }

  next = {
    ...next,
    jobBids: (next.jobBids ?? []).map((item) => {
      if (item.jobId !== jobId) return item;
      if (item.id === bidId) return { ...item, status: "accepted" as const };
      if (item.status === "pending") {
        return { ...item, status: "rejected" as const };
      }
      return item;
    }),
    jobPosts: (next.jobPosts ?? []).map((item) =>
      item.id === jobId
        ? {
            ...item,
            status: "awarded" as const,
            awardedBidId: bidId,
            awardedBookingId: createdBooking?.id,
          }
        : item,
    ),
  };

  next = addNotification(next, {
    providerId: bid.providerId,
    type: "system",
    title: "Bid accepted",
    body: `${job.seekerName} accepted your bid on “${job.title}”.`,
    href: createdBooking
      ? `/provider/bookings/${createdBooking.id}`
      : "/provider/bookings",
  });

  return { state: next };
}
