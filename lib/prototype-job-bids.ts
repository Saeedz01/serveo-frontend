import type { PrototypeJobBid, PrototypeState } from "./prototype-types";

/** Pending bids stay actionable while the job is open (no timed expiry). */
export function isBidLive(bid: PrototypeJobBid): boolean {
  return bid.status === "pending";
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

/** Bids a seeker can still see/act on: pending offers plus accepted. */
export function visibleBidsForJob(
  state: PrototypeState,
  jobId: string,
): PrototypeJobBid[] {
  return bidsForJob(state, jobId).filter((bid) => {
    if (bid.status === "accepted") return true;
    if (bid.status === "pending") return true;
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
): PrototypeJobBid | undefined {
  const bid = bidForProviderOnJob(state, jobId, providerId);
  if (!bid || !isBidLive(bid)) return undefined;
  return bid;
}
