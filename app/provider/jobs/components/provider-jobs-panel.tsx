"use client";

import Link from "next/link";
import {
  Button,
  EmptyState,
  PageHeader,
  Typography,
} from "@/components/ui";
import { usePrototype } from "@/components/prototype/prototype-provider";
import { formatBookingDateTime } from "@/lib/prototype-bookings";

export function ProviderJobsPanel() {
  const {
    ready,
    currentProvider,
    openJobPosts,
    liveBidForProviderOnJob,
  } = usePrototype();

  if (!ready) {
    return <Typography variant="body">Loading jobs...</Typography>;
  }

  if (!currentProvider) {
    return (
      <EmptyState
        title="Provider session required"
        description="Log in to browse open jobs and place bids."
        action={
          <Button as="a" href="/provider/login">
            Provider login
          </Button>
        }
      />
    );
  }

  if (currentProvider.status !== "verified") {
    return (
      <div className="space-y-[var(--space-6)]">
        <PageHeader
          tone="primary"
          eyebrow="Jobs"
          title="Open jobs"
          description="Verified providers can bid on seeker job posts."
        />
        <EmptyState
          title={
            currentProvider.status === "pending"
              ? "Verification pending"
              : "Bidding unavailable"
          }
          description={
            currentProvider.status === "pending"
              ? "Once an admin verifies your account, you can bid on open jobs."
              : "Only verified providers can place bids on the job board."
          }
        />
      </div>
    );
  }

  const jobs = openJobPosts();

  return (
    <div className="space-y-[var(--space-6)]">
      <PageHeader
        tone="primary"
        eyebrow="Jobs"
        title="Open jobs"
        description="Browse open seeker posts and bid a price. Closed jobs never appear here."
      />

      {jobs.length === 0 ? (
        <EmptyState
          title="No open jobs"
          description="When seekers post jobs, they appear here for bidding. Closed or awarded jobs are hidden."
        />
      ) : (
        <ul className="overflow-hidden rounded-[var(--radius-xl)] border border-border bg-surface divide-y divide-border">
          {jobs.map((job) => {
            const myBid = liveBidForProviderOnJob(job.id, currentProvider.id);
            return (
              <li key={job.id}>
                <Link
                  href={`/provider/jobs/${job.id}`}
                  className="flex flex-col gap-1 px-[var(--space-5)] py-[var(--space-5)] transition-colors hover:bg-secondary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-primary sm:flex-row sm:items-start sm:justify-between"
                >
                  <div className="min-w-0 flex-1 space-y-1">
                    <Typography variant="h4">{job.title}</Typography>
                    <Typography
                      variant="body"
                      className="line-clamp-2 text-muted"
                    >
                      {job.description}
                    </Typography>
                    <Typography variant="caption" className="block text-muted">
                      {job.location.address}
                    </Typography>
                    {myBid ? (
                      <Typography variant="caption" className="block text-primary">
                        Your live bid: ${myBid.amount.toFixed(0)}
                      </Typography>
                    ) : (
                      <Typography variant="caption" className="block text-muted">
                        No live bid
                      </Typography>
                    )}
                  </div>
                  <Typography
                    variant="caption"
                    className="shrink-0 text-muted sm:pt-1"
                  >
                    {formatBookingDateTime(job.createdAt)}
                  </Typography>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
