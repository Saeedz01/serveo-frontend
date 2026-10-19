"use client";

import Link from "next/link";
import { Button, EmptyState, Typography } from "@/components/ui";
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
    <ul className="overflow-hidden rounded-[var(--radius-xl)] border border-border bg-surface divide-y divide-border">
      {jobs.map((job) => (
        <li key={job.id}>
          <Link
            href={`/jobs/${job.id}`}
            className="flex flex-col gap-1 px-[var(--space-5)] py-[var(--space-5)] transition-colors hover:bg-secondary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-primary sm:flex-row sm:items-start sm:justify-between"
          >
            <div className="min-w-0 flex-1 space-y-1">
              <Typography variant="h4">{job.title}</Typography>
              <Typography variant="caption" className="block text-muted">
                {jobStatusLabel(job.status)} · {job.categoryName} ·{" "}
                {job.address}
              </Typography>
            </div>
            <div className="shrink-0 space-y-1 sm:pt-1 sm:text-right">
              <Typography variant="caption" className="block text-muted">
                Needed {formatBookingDateTime(job.requestedAt)}
              </Typography>
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
  );
}
