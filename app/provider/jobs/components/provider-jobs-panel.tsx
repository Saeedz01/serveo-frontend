"use client";

import Link from "next/link";
import {
  CalendarClock,
  ChevronRight,
  CircleDot,
  Layers,
  MapPin,
} from "lucide-react";
import {
  Button,
  EmptyState,
  PageHeader,
  ProviderListSkeleton,
  Typography,
} from "@/components/ui";
import { usePrototype } from "@/components/prototype/prototype-provider";
import { cx } from "@/lib/cx";
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
    <ul className="space-y-[var(--space-3)]">
      {jobs.map((job) => {
        const isUnopened = unseenJobIds.has(job.id);
        const relative = formatRelativeTime(job.requestedAt);

        return (
          <li key={job.id}>
            <Link
              href={`/provider/jobs/${job.id}`}
              className={cx(
                "group relative flex flex-col overflow-hidden rounded-[var(--radius-xl)] border bg-surface",
                "shadow-[0_14px_36px_-30px_rgba(10,10,10,0.45)]",
                "transition-[border-color,box-shadow,transform] duration-200 ease-out",
                "hover:-translate-y-0.5 hover:border-primary/35 hover:shadow-[0_22px_48px_-28px_rgba(92,61,145,0.35)]",
                "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
                "sm:flex-row sm:items-stretch",
                isUnopened ? "border-primary/30" : "border-border",
              )}
            >
              <span
                aria-hidden
                className={cx(
                  "absolute inset-y-0 left-0 w-1 sm:w-1.5",
                  isUnopened ? "bg-primary" : "bg-primary/40",
                )}
              />

              <div className="flex min-w-0 flex-1 flex-col justify-center gap-[var(--space-3)] px-[var(--space-5)] py-[var(--space-5)] pl-[calc(var(--space-5)+0.35rem)] sm:pr-[var(--space-4)]">
                <div className="flex flex-wrap items-center gap-2.5">
                  <Typography
                    variant="h4"
                    className="min-w-0 truncate tracking-tight"
                  >
                    {job.title}
                  </Typography>
                  <span className="inline-flex items-center gap-1.5 rounded-[var(--radius-full)] bg-primary-soft px-2.5 py-1 text-[length:var(--text-xs)] font-semibold tracking-wide text-primary">
                    <CircleDot className="h-3.5 w-3.5" aria-hidden />
                    Open
                  </span>
                  {isUnopened ? (
                    <span className="inline-flex items-center rounded-[var(--radius-full)] bg-primary px-2.5 py-1 text-[length:var(--text-xs)] font-semibold text-primary-foreground">
                      New
                    </span>
                  ) : null}
                </div>

                {job.description ? (
                  <Typography
                    variant="caption"
                    className="line-clamp-2 text-muted"
                  >
                    {job.description}
                  </Typography>
                ) : null}

                <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-[var(--space-4)] sm:gap-y-2">
                  <span className="inline-flex min-w-0 items-center gap-2 text-[length:var(--text-sm)] text-muted">
                    <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-[var(--radius-md)] bg-secondary text-foreground/70">
                      <Layers className="h-3.5 w-3.5" aria-hidden />
                    </span>
                    <span className="truncate font-medium text-foreground/80">
                      {job.categoryName}
                    </span>
                  </span>

                  <span
                    className="hidden h-1 w-1 rounded-full bg-border sm:inline-flex"
                    aria-hidden
                  />

                  <span className="inline-flex min-w-0 items-center gap-2 text-[length:var(--text-sm)] text-muted">
                    <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-[var(--radius-md)] bg-secondary text-foreground/70">
                      <CalendarClock className="h-3.5 w-3.5" aria-hidden />
                    </span>
                    <span className="min-w-0">
                      {relative ? (
                        <span className="font-semibold text-foreground">
                          {relative}
                        </span>
                      ) : null}
                      <span
                        className={cx(
                          "text-muted/80",
                          relative && "before:mx-1.5 before:content-['·']",
                        )}
                      >
                        {formatBookingDateTime(job.requestedAt)}
                      </span>
                    </span>
                  </span>
                </div>

                {job.address ? (
                  <span className="inline-flex min-w-0 items-center gap-2 text-[length:var(--text-sm)] text-muted">
                    <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-[var(--radius-md)] bg-secondary text-foreground/70">
                      <MapPin className="h-3.5 w-3.5" aria-hidden />
                    </span>
                    <span className="truncate text-foreground/80">
                      {job.address}
                    </span>
                  </span>
                ) : null}
              </div>

              <div className="flex shrink-0 items-center justify-end gap-[var(--space-3)] border-t border-border/70 px-[var(--space-5)] py-[var(--space-4)] sm:border-t-0 sm:border-l sm:border-border/70 sm:px-[var(--space-5)] sm:py-[var(--space-5)]">
                <span
                  className={cx(
                    "inline-flex h-10 w-10 items-center justify-center rounded-[var(--radius-full)] border border-border bg-surface text-primary",
                    "transition-all duration-200",
                    "group-hover:border-primary/40 group-hover:bg-primary group-hover:text-primary-foreground",
                    "group-hover:translate-x-0.5",
                  )}
                  aria-hidden
                >
                  <ChevronRight className="h-4 w-4" />
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
    refetchOnFocus: false,
  });
  const matched = feed?.matched ?? [];
  const alsoRelevant = feed?.alsoRelevant ?? [];
  const unseenJobIds = useUnseenJobIdSet(currentProvider?.id);

  if (ready && !currentProvider) {
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

  if (ready && currentProvider && currentProvider.status !== "verified") {
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

  if (ready && currentProvider && !hasToken) {
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

  const listLoading = !ready || isLoading;
  const empty = matched.length === 0 && alsoRelevant.length === 0;

  return (
    <div className="space-y-[var(--space-6)]">
      <PageHeader
        tone="primary"
        eyebrow="Jobs"
        title="Open jobs"
        description="Exact category matches appear first. Also relevant jobs match your service titles, descriptions, or specialties. New jobs stay highlighted until you open them."
      />

      {listLoading ? (
        <ProviderListSkeleton rows={5} />
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
