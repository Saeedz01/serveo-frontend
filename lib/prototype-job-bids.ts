import type { PrototypeJobBid, PrototypeState } from "./prototype-types";

/** How long a pending bid stays visible and acceptable to the seeker. */
export const JOB_BID_VISIBLE_MS = 40_000;

export function bidExpiresAtMs(bid: PrototypeJobBid): number {
  return new Date(bid.createdAt).getTime() + JOB_BID_VISIBLE_MS;
}

export function isBidLive(
  bid: PrototypeJobBid,
  nowMs: number = Date.now(),
): boolean {
  return bid.status === "pending" && nowMs < bidExpiresAtMs(bid);
}

export function bidRemainingMs(
  bid: PrototypeJobBid,
  nowMs: number = Date.now(),
): number {
  if (bid.status !== "pending") return 0;
  return Math.max(0, bidExpiresAtMs(bid) - nowMs);
}

export function bidsForJob(
  state: PrototypeState,
  jobId: string,
): PrototypeJobBid[] {
  return (state.jobBids ?? [])
    .filter((bid) => bid.jobId === jobId)
    .slice()
    .sort(
      (a, b) => a.amount - b.amount || b.createdAt.localeCompare(a.createdAt),
    );
}

/** Bids a seeker can still see/act on: live pending offers, plus accepted. */
export function visibleBidsForJob(
  state: PrototypeState,
  jobId: string,
  nowMs: number = Date.now(),
): PrototypeJobBid[] {
  return bidsForJob(state, jobId).filter((bid) => {
    if (bid.status === "accepted") return true;
    if (bid.status === "pending") return isBidLive(bid, nowMs);
    return false;
  });
}

export function bidForProviderOnJob(
  state: PrototypeState,
  jobId: string,
  providerId: string,
): PrototypeJobBid | undefined {
  return (state.jobBids ?? []).find(
    (bid) => bid.jobId === jobId && bid.providerId === providerId,
  );
}

export function liveBidForProviderOnJob(
  state: PrototypeState,
  jobId: string,
  providerId: string,
  nowMs: number = Date.now(),
): PrototypeJobBid | undefined {
  const bid = bidForProviderOnJob(state, jobId, providerId);
  if (!bid || !isBidLive(bid, nowMs)) return undefined;
  return bid;
}
