"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
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
import { useUnseenJobIdSet } from "@/lib/provider-unseen-jobs";
import type { JobDto } from "@/service/api";
import { useGetProviderJobFeedQuery } from "@/service/api";
import { getAccessToken } from "@/service/splitApiSetting";

function JobFeedList({
  jobs,
  unseenJobIds,
}: {
  jobs: JobDto[];
  unseenJobIds: Set<string>;
}) {
  return (
    <ul className="overflow-hidden rounded-[var(--radius-xl)] border border-border bg-surface divide-y divide-border">
      {jobs.map((job) => {
        const isUnopened = unseenJobIds.has(job.id);
        return (
          <li key={job.id}>
            <Link
              href={`/provider/jobs/${job.id}`}
              className={`relative flex flex-col gap-[var(--space-3)] px-[var(--space-5)] py-[var(--space-5)] transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-primary sm:flex-row sm:items-center sm:justify-between ${
                isUnopened
                  ? "border-l-4 border-l-primary bg-primary-soft hover:bg-primary-soft/90"
                  : "hover:bg-secondary/40"
              }`}
            >
              <div className="min-w-0 flex-1 space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <Typography variant="h4">{job.title}</Typography>
                  {isUnopened ? (
                    <span className="rounded-full bg-primary px-2.5 py-0.5 text-[length:var(--text-xs)] font-semibold text-primary-foreground shadow-sm">
                      New
                    </span>
                  ) : null}
                </div>
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
                  {formatRelativeTime(job.requestedAt)
                    ? ` · ${formatRelativeTime(job.requestedAt)}`
                    : ""}
                </Typography>
              </div>
              <div className="flex shrink-0 items-center gap-[var(--space-3)]">
                {formatRelativeTime(job.requestedAt) && !isUnopened ? (
                  <span className="inline-flex items-center rounded-[var(--radius-full)] bg-secondary px-2.5 py-0.5 text-[length:var(--text-xs)] font-semibold text-muted">
                    {formatRelativeTime(job.requestedAt)}
                  </span>
                ) : null}
                <span className="inline-flex items-center gap-1 text-[length:var(--text-sm)] font-medium text-primary">
                  Open
                  <ChevronRight className="h-4 w-4" aria-hidden />
                </span>
              </div>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

export function ProviderJobsPanel() {
  const { ready, currentProvider } = usePrototype();
  const hasToken = Boolean(getAccessToken());
  const {
    data: feed,
    isLoading,
    isError,
  } = useGetProviderJobFeedQuery(undefined, {
    skip: !ready || !currentProvider || !hasToken,
  });
  const matched = feed?.matched ?? [];
  const alsoRelevant = feed?.alsoRelevant ?? [];
  const unseenJobIds = useUnseenJobIdSet(currentProvider?.id);

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
        description="Sign in again to load jobs that match your published services."
        action={
          <Button as="a" href="/provider/login">
            Provider login
          </Button>
        }
      />
    );
  }

  const empty = matched.length === 0 && alsoRelevant.length === 0;

  return (
    <div className="space-y-[var(--space-6)]">
      <PageHeader
        tone="primary"
        eyebrow="Jobs"
        title="Open jobs"
        description="Exact category matches appear first. Also relevant jobs match your service titles, descriptions, or specialties. New jobs stay highlighted until you open them."
      />

      {isLoading ? (
        <Typography variant="body">Loading matching jobs...</Typography>
      ) : isError ? (
        <EmptyState
          title="Could not load jobs"
          description="Refresh the page or sign in again."
        />
      ) : empty ? (
        <EmptyState
          title="No matching open jobs"
          description="When seekers post jobs that match your published services, they appear here."
        />
      ) : (
        <>
          <section className="space-y-[var(--space-3)]">
            <Typography variant="h3">Matched</Typography>
            {matched.length === 0 ? (
              <Typography variant="body" className="text-muted">
                No exact category matches right now.
              </Typography>
            ) : (
              <JobFeedList jobs={matched} unseenJobIds={unseenJobIds} />
            )}
          </section>

          {alsoRelevant.length > 0 ? (
            <section className="space-y-[var(--space-3)]">
              <div>
                <Typography variant="h3">Also relevant</Typography>
                <Typography variant="caption" className="mt-1 block text-muted">
                  Based on keywords in your published services — ranked below exact matches.
                </Typography>
              </div>
              <JobFeedList jobs={alsoRelevant} unseenJobIds={unseenJobIds} />
            </section>
          ) : null}
        </>
      )}
    </div>
  );
}
