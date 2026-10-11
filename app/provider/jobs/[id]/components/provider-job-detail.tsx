"use client";

import { useEffect, useState } from "react";
import {
  Button,
  EmptyState,
  PageHeader,
  Typography,
} from "@/components/ui";
import { usePrototype } from "@/components/prototype/prototype-provider";
import { formatBookingDateTime } from "@/lib/prototype-bookings";
import {
  bidRemainingMs,
  isBidLive,
  JOB_BID_VISIBLE_MS,
} from "@/lib/prototype-jobs";
import { ProviderBidForm } from "./provider-bid-form";

type ProviderJobDetailProps = {
  jobId: string;
};

export function ProviderJobDetail({ jobId }: ProviderJobDetailProps) {
  const {
    ready,
    currentProvider,
    getJobPost,
    bidForProviderOnJob,
    liveBidForProviderOnJob,
  } = usePrototype();
  const [nowMs, setNowMs] = useState(() => Date.now());

  useEffect(() => {
    const id = window.setInterval(() => setNowMs(Date.now()), 250);
    return () => window.clearInterval(id);
  }, []);

  if (!ready) {
    return <Typography variant="body">Loading job...</Typography>;
  }

  if (!currentProvider) {
    return (
      <EmptyState
        title="Provider session required"
        description="Log in to view this job and place a bid."
        action={
          <Button as="a" href="/provider/login">
            Provider login
          </Button>
        }
      />
    );
  }

  const job = getJobPost(jobId);
  if (!job || job.status !== "open") {
    return (
      <EmptyState
        title="Job unavailable"
        description="This job is closed or awarded and is no longer shown to providers."
        action={
          <Button as="a" href="/provider/jobs">
            Back to open jobs
          </Button>
        }
      />
    );
  }

  const liveBid = liveBidForProviderOnJob(job.id, currentProvider.id);
  const lastBid = bidForProviderOnJob(job.id, currentProvider.id);
  const expiredPending =
    lastBid?.status === "pending" && !isBidLive(lastBid, nowMs);
  const canBid =
    currentProvider.status === "verified" && !liveBid;

  return (
    <div className="mx-auto w-full max-w-2xl space-y-[var(--space-6)]">
      <PageHeader
        tone="primary"
        eyebrow="Open job"
        title={job.title}
        description={job.description}
        actions={
          <Button as="a" href="/provider/jobs" variant="secondary">
            All jobs
          </Button>
        }
      />

      <div className="space-y-1 rounded-[var(--radius-xl)] border border-border bg-surface p-[var(--space-5)]">
        <Typography variant="caption" className="block text-muted">
          Posted {formatBookingDateTime(job.createdAt)} by {job.seekerName}
        </Typography>
        <Typography variant="body">{job.location.address}</Typography>
        <Typography variant="caption" className="block text-muted">
          Offers stay visible to the seeker for {JOB_BID_VISIBLE_MS / 1000}{" "}
          seconds.
        </Typography>
      </div>

      {currentProvider.status !== "verified" ? (
        <EmptyState
          title="Verification required"
          description="Only verified providers can bid on job posts."
        />
      ) : liveBid ? (
        <div className="space-y-[var(--space-3)] rounded-[var(--radius-xl)] border border-border bg-surface p-[var(--space-5)]">
          <Typography variant="h3">Your live bid</Typography>
          <Typography variant="body" className="font-semibold">
            ${liveBid.amount.toFixed(0)}
          </Typography>
          {liveBid.note ? (
            <Typography variant="body" className="text-muted">
              “{liveBid.note}”
            </Typography>
          ) : null}
          <Typography variant="caption" className="block text-muted">
            {Math.ceil(bidRemainingMs(liveBid, nowMs) / 1000)}s left for the
            seeker to accept
          </Typography>
        </div>
      ) : (
        <>
          {expiredPending ? (
            <Typography variant="caption" className="block text-muted">
              Your previous offer expired after {JOB_BID_VISIBLE_MS / 1000}s.
              You can place a new bid.
            </Typography>
          ) : null}
          {canBid ? (
            <ProviderBidForm
              jobId={job.id}
              providerId={currentProvider.id}
              providerName={currentProvider.name}
            />
          ) : null}
        </>
      )}
    </div>
  );
}
