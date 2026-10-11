"use client";

import { useEffect, useState } from "react";
import { Button, EmptyState, Typography } from "@/components/ui";
import {
  bidRemainingMs,
  isBidLive,
  JOB_BID_VISIBLE_MS,
} from "@/lib/prototype-jobs";
import type { PrototypeJobBid, PrototypeJobPost } from "@/lib/prototype-types";
import { BidCountdownBar } from "./bid-countdown-bar";

type JobBidsPanelProps = {
  job: PrototypeJobPost;
  bids: PrototypeJobBid[];
  canAccept: boolean;
  onAccept: (bidId: string) => { ok: true } | { ok: false; reason: string };
};

export function JobBidsPanel({
  job,
  bids,
  canAccept,
  onAccept,
}: JobBidsPanelProps) {
  const [nowMs, setNowMs] = useState(() => Date.now());
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);

  useEffect(() => {
    const hasLive = bids.some((bid) => isBidLive(bid, Date.now()));
    if (!hasLive) return;

    const id = window.setInterval(() => setNowMs(Date.now()), 100);
    return () => window.clearInterval(id);
  }, [bids]);

  const visible = bids.filter((bid) => {
    if (bid.status === "accepted") return true;
    if (bid.status === "pending") return isBidLive(bid, nowMs);
    return false;
  });

  const handleAccept = (bidId: string) => {
    setError("");
    setBusyId(bidId);
    const result = onAccept(bidId);
    setBusyId(null);
    if (!result.ok) setError(result.reason);
  };

  if (visible.length === 0) {
    return (
      <EmptyState
        title={job.status === "open" ? "No live bids" : "No bids"}
        description={
          job.status === "open"
            ? `Provider offers appear here for ${JOB_BID_VISIBLE_MS / 1000} seconds. After that they disappear and can’t be accepted.`
            : "This job has no bids to show."
        }
      />
    );
  }

  return (
    <div className="space-y-[var(--space-4)]">
      <Typography variant="h3">Live bids ({visible.length})</Typography>
      {error ? (
        <Typography variant="caption" className="block text-error">
          {error}
        </Typography>
      ) : null}
      <ul className="overflow-hidden rounded-[var(--radius-xl)] border border-border bg-surface divide-y divide-border">
        {visible.map((bid) => {
          const remaining = bidRemainingMs(bid, nowMs);
          const live = bid.status === "pending" && remaining > 0;

          return (
            <li
              key={bid.id}
              className="flex flex-col gap-[var(--space-3)] px-[var(--space-5)] py-[var(--space-5)]"
            >
              <div className="flex flex-col gap-[var(--space-3)] sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0 flex-1 space-y-1">
                  <Typography variant="h4">{bid.providerName}</Typography>
                  <Typography variant="body" className="font-semibold">
                    ${bid.amount.toFixed(0)}
                  </Typography>
                  {bid.note ? (
                    <Typography variant="body" className="text-muted">
                      “{bid.note}”
                    </Typography>
                  ) : null}
                  {bid.status === "accepted" ? (
                    <Typography variant="caption" className="block text-muted">
                      Accepted
                    </Typography>
                  ) : null}
                </div>
                {canAccept && live ? (
                  <Button
                    type="button"
                    disabled={busyId === bid.id}
                    onClick={() => handleAccept(bid.id)}
                  >
                    {busyId === bid.id ? "Accepting..." : "Accept bid"}
                  </Button>
                ) : null}
              </div>
              {live ? <BidCountdownBar remainingMs={remaining} /> : null}
            </li>
          );
        })}
      </ul>
      {canAccept ? (
        <Typography variant="caption" className="block text-muted">
          Each offer lasts {JOB_BID_VISIBLE_MS / 1000}s. Accepting creates a
          confirmed booking and awards the job.
        </Typography>
      ) : null}
    </div>
  );
}
