"use client";

import Link from "next/link";
import {
  CalendarClock,
  CheckCircle2,
  ChevronRight,
  CircleDot,
  Layers,
  Lock,
  Phone,
  UserRound,
} from "lucide-react";
import { Button, EmptyState, Typography } from "@/components/ui";
import { cx } from "@/lib/cx";
import {
  formatBookingDateTime,
  formatRelativeTime,
} from "@/lib/prototype-bookings";
import type { JobDto, JobStatusDto } from "@/service/api";

type SeekerJobPostsProps = {
  jobs: JobDto[];
};

function jobStatusLabel(status: JobStatusDto) {
  if (status === "awarded") return "Awarded";
  if (status === "closed") return "Closed";
  return "Open";
}

function bidUnitLabel(count: number) {
  return count === 1 ? "bid" : "bids";
}

function StatusIcon({ status }: { status: JobStatusDto }) {
  if (status === "awarded") {
    return <CheckCircle2 className="h-3.5 w-3.5" aria-hidden />;
  }
  if (status === "closed") {
    return <Lock className="h-3.5 w-3.5" aria-hidden />;
  }
  return <CircleDot className="h-3.5 w-3.5" aria-hidden />;
}

export function SeekerJobPosts({ jobs }: SeekerJobPostsProps) {
  if (jobs.length === 0) {
    return (
      <EmptyState
        title="No job posts yet"
        description="Post a job on the board and providers will bid a price."
        action={
          <Button as="a" href="/jobs/new">
            Post a job
          </Button>
        }
      />
    );
  }

  return (
    <ul className="space-y-[var(--space-3)]">
      {jobs.map((job) => {
        const relative = formatRelativeTime(job.requestedAt);
        const bidCount = job.bidCount ?? 0;
        const hasBids = bidCount > 0;
        const isOpen = job.status === "open";
        const isAwarded = job.status === "awarded";

        return (
          <li key={job.id}>
            <Link
              href={`/jobs/${job.id}`}
              className={cx(
                "group relative flex flex-col overflow-hidden rounded-[var(--radius-xl)] border bg-surface",
                "shadow-[0_14px_36px_-30px_rgba(10,10,10,0.45)]",
                "transition-[border-color,box-shadow,transform] duration-200 ease-out",
                "hover:-translate-y-0.5 hover:border-primary/35 hover:shadow-[0_22px_48px_-28px_rgba(92,61,145,0.35)]",
                "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
                "sm:flex-row sm:items-stretch",
                isOpen
                  ? "border-border"
                  : isAwarded
                    ? "border-emerald-200/80"
                    : "border-border/80 opacity-95",
              )}
            >
              <span
                aria-hidden
                className={cx(
                  "absolute inset-y-0 left-0 w-1 sm:w-1.5",
                  isOpen && "bg-primary",
                  isAwarded && "bg-success",
                  job.status === "closed" && "bg-muted",
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
                  <span
                    className={cx(
                      "inline-flex items-center gap-1.5 rounded-[var(--radius-full)] px-2.5 py-1 text-[length:var(--text-xs)] font-semibold tracking-wide",
                      isOpen && "bg-primary-soft text-primary",
                      isAwarded && "bg-emerald-50 text-success",
                      job.status === "closed" && "bg-secondary text-muted",
                    )}
                  >
                    <StatusIcon status={job.status} />
                    {jobStatusLabel(job.status)}
                  </span>
                </div>

                <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-[var(--space-4)] sm:gap-y-2">
                  <span className="inline-flex min-w-0 items-center gap-2 text-[length:var(--text-sm)] text-muted">
                    <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-[var(--radius-md)] bg-secondary text-foreground/70">
                      <Layers className="h-3.5 w-3.5" aria-hidden />
                    </span>
                    <span className="truncate font-medium text-foreground/80">
                      {job.categoryName}
                    </span>
                  </span>

                  <span className="hidden h-1 w-1 rounded-full bg-border sm:inline-flex" aria-hidden />

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

                {isOpen ? (
                  <Typography
                    variant="caption"
                    className={cx(
                      "font-medium",
                      hasBids ? "text-primary" : "text-muted",
                    )}
                  >
                    {hasBids
                      ? "Providers are bidding — review offers"
                      : "Waiting for providers to bid"}
                  </Typography>
                ) : null}

                {isAwarded && job.awardedProvider ? (
                  <div className="flex flex-col gap-1.5">
                    <span className="inline-flex min-w-0 items-center gap-2 text-[length:var(--text-sm)] text-muted">
                      <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-[var(--radius-md)] bg-emerald-50 text-success">
                        <UserRound className="h-3.5 w-3.5" aria-hidden />
                      </span>
                      <span className="truncate font-medium text-foreground/85">
                        {job.awardedProvider.name}
                        <span className="text-muted">
                          {" "}
                          · ${job.awardedProvider.bidPrice.toFixed(0)}
                        </span>
                      </span>
                    </span>
                    {job.awardedProvider.phone ? (
                      <span className="inline-flex min-w-0 items-center gap-2 text-[length:var(--text-sm)] font-semibold text-primary">
                        <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-[var(--radius-md)] bg-primary-soft text-primary">
                          <Phone className="h-3.5 w-3.5" aria-hidden />
                        </span>
                        <span className="truncate">
                          {job.awardedProvider.phone}
                        </span>
                      </span>
                    ) : null}
                  </div>
                ) : null}
              </div>

              <div className="flex shrink-0 items-center gap-[var(--space-3)] border-t border-border/70 px-[var(--space-5)] py-[var(--space-4)] sm:border-t-0 sm:border-l sm:border-border/70 sm:px-[var(--space-5)] sm:py-[var(--space-5)]">
                <div
                  className={cx(
                    "relative flex min-w-[5.5rem] flex-col items-center justify-center rounded-[var(--radius-lg)] px-[var(--space-4)] py-[var(--space-3)] text-center transition-colors duration-200",
                    hasBids
                      ? "bg-primary text-primary-foreground shadow-[0_12px_28px_-16px_rgba(92,61,145,0.85)]"
                      : "bg-primary-soft text-primary",
                  )}
                  aria-label={`${bidCount} ${bidUnitLabel(bidCount)}`}
                >
                  {hasBids ? (
                    <span
                      aria-hidden
                      className="pointer-events-none absolute inset-0 rounded-[var(--radius-lg)] bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.22),transparent_55%)]"
                    />
                  ) : null}
                  <span
                    className={cx(
                      "relative font-[family-name:var(--font-display)] text-[length:var(--text-2xl)] font-semibold leading-none tracking-tight tabular-nums sm:text-[length:var(--text-3xl)]",
                      hasBids ? "text-primary-foreground" : "text-primary",
                    )}
                  >
                    {bidCount}
                  </span>
                  <span
                    className={cx(
                      "relative mt-1 text-[length:var(--text-xs)] font-semibold tracking-[0.14em] uppercase",
                      hasBids
                        ? "text-primary-foreground/85"
                        : "text-primary/80",
                    )}
                  >
                    {bidUnitLabel(bidCount)}
                  </span>
                </div>

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
