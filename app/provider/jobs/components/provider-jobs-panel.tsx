"use client";

import Link from "next/link";
import { useEffect } from "react";
import {
  Button,
  EmptyState,
  PageHeader,
  Typography,
} from "@/components/ui";
import { usePrototype } from "@/components/prototype/prototype-provider";
import {
  formatBookingDateTime,
  formatRelativeTime,
} from "@/lib/prototype-bookings";
import { markJobsSeen } from "@/lib/provider-unseen-jobs";
import { useGetProviderJobFeedQuery } from "@/service/api";
import { getAccessToken } from "@/service/splitApiSetting";

export function ProviderJobsPanel() {
  const { ready, currentProvider } = usePrototype();
  const hasToken = Boolean(getAccessToken());
  const {
    data: jobs = [],
    isLoading,
    isError,
  } = useGetProviderJobFeedQuery(undefined, {
    skip: !ready || !currentProvider || !hasToken,
  });

  // Opening Open jobs clears the nav unread badge for those jobs.
  useEffect(() => {
    if (!currentProvider || jobs.length === 0) return;
    markJobsSeen(
      currentProvider.id,
      jobs.map((job) => job.id),
    );
  }, [currentProvider, jobs]);

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

  if (!hasToken) {
    return (
      <EmptyState
        title="Session expired"
        description="Sign in again to load jobs that match your published service categories."
        action={
          <Button as="a" href="/provider/login">
            Provider login
          </Button>
        }
      />
    );
  }

  return (
    <div className="space-y-[var(--space-6)]">
      <PageHeader
        tone="primary"
        eyebrow="Jobs"
        title="Open jobs"
        description="Only jobs in categories where you have a published service are shown."
      />

      {isLoading ? (
        <Typography variant="body">Loading matching jobs...</Typography>
      ) : isError ? (
        <EmptyState
          title="Could not load jobs"
          description="Refresh the page or sign in again."
        />
      ) : jobs.length === 0 ? (
        <EmptyState
          title="No matching open jobs"
          description="When seekers post jobs in categories you publish, they appear here."
        />
      ) : (
        <ul className="overflow-hidden rounded-[var(--radius-xl)] border border-border bg-surface divide-y divide-border">
          {jobs.map((job) => (
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
                    {job.categoryName} · {job.address}
                  </Typography>
                  <Typography variant="caption" className="block text-muted">
                    Needed {formatBookingDateTime(job.requestedAt)}
                  </Typography>
                </div>
                <div className="shrink-0 space-y-1 sm:pt-1 sm:text-right">
                  {formatRelativeTime(job.requestedAt) ? (
                    <span className="inline-flex items-center rounded-[var(--radius-full)] bg-primary px-2.5 py-0.5 text-[length:var(--text-xs)] font-semibold text-primary-foreground">
                      {formatRelativeTime(job.requestedAt)}
                    </span>
                  ) : null}
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
