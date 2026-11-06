"use client";

import {
  Button,
  EmptyState,
  ProviderListSkeleton,
  Typography,
} from "@/components/ui";
import { formatBookingDateTime } from "@/lib/prototype-bookings";
import type { BiddingDto, JobDto } from "@/service/api";

type JobBidsPanelProps = {
  job: JobDto;
  bids: BiddingDto[];
  loading?: boolean;
  canAccept?: boolean;
  acceptingBidId?: string | null;
  onAcceptBid?: (bidId: string) => void;
};

function bidStatusLabel(status: BiddingDto["status"]) {
  if (status === "accepted") return "Accepted";
  if (status === "rejected") return "Not selected";
  return "Pending";
}

export function JobBidsPanel({
  job,
  bids,
  loading,
  canAccept = false,
  acceptingBidId = null,
  onAcceptBid,
}: JobBidsPanelProps) {
  if (loading) {
    return <ProviderListSkeleton rows={3} />;
  }

  if (bids.length === 0) {
    return (
      <EmptyState
        title={job.status === "open" ? "No bids yet" : "No bids"}
        description={
          job.status === "open"
            ? "Provider offers stay here until you accept one or close the job."
            : "This job has no bids to show."
        }
      />
    );
  }

  return (
    <div className="space-y-[var(--space-4)]">
      <Typography variant="h3">Bids ({bids.length})</Typography>
      <ul className="overflow-hidden rounded-[var(--radius-xl)] border border-border bg-surface divide-y divide-border">
        {bids.map((bid) => {
          const showAccept =
            canAccept &&
            job.status === "open" &&
            bid.status === "pending" &&
            Boolean(onAcceptBid);

          return (
            <li
              key={bid.id}
              className="flex flex-col gap-[var(--space-3)] px-[var(--space-5)] py-[var(--space-5)] sm:flex-row sm:items-start sm:justify-between"
            >
              <div className="min-w-0 flex-1 space-y-1">
                <Typography variant="h4">{bid.providerName}</Typography>
                <Typography variant="body" className="font-semibold">
                  ${bid.price.toFixed(0)}
                </Typography>
                {bid.note ? (
                  <Typography variant="body" className="text-muted">
                    “{bid.note}”
                  </Typography>
                ) : null}
                <Typography variant="caption" className="block text-muted">
                  Received {formatBookingDateTime(bid.createdAt)} ·{" "}
                  {bidStatusLabel(bid.status)}
                </Typography>
              </div>
              {showAccept ? (
                <Button
                  type="button"
                  disabled={acceptingBidId === bid.id}
                  onClick={() => onAcceptBid?.(bid.id)}
                >
                  {acceptingBidId === bid.id ? "Accepting…" : "Accept bid"}
                </Button>
              ) : null}
              {bid.status === "accepted" ? (
                <span className="inline-flex items-center rounded-[var(--radius-full)] bg-primary px-3 py-1 text-[length:var(--text-sm)] font-semibold text-primary-foreground">
                  Confirmed
                </span>
              ) : null}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
