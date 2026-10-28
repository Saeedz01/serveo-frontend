"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
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

function jobStatusClass(status: JobStatusDto) {
  if (status === "awarded") {
    return "bg-emerald-50 text-success";
  }
  if (status === "closed") {
    return "bg-secondary text-muted";
  }
  return "bg-primary-soft text-primary";
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
      {jobs.map((job) => (
        <li key={job.id}>
          <Link
            href={`/jobs/${job.id}`}
            className="flex flex-col gap-[var(--space-4)] rounded-[var(--radius-xl)] border border-border bg-surface p-[var(--space-5)] shadow-[0_12px_32px_-28px_rgba(10,10,10,0.35)] transition-colors hover:border-primary/30 hover:bg-primary-soft/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="min-w-0 flex-1 space-y-[var(--space-2)]">
              <div className="flex flex-wrap items-center gap-2">
                <Typography variant="h4">{job.title}</Typography>
                <span
                  className={`inline-flex items-center rounded-[var(--radius-full)] px-2.5 py-0.5 text-[length:var(--text-xs)] font-semibold ${jobStatusClass(job.status)}`}
                >
                  {jobStatusLabel(job.status)}
                </span>
              </div>
              <Typography variant="caption" className="block text-muted">
                {job.categoryName}
                {job.address ? ` · ${job.address}` : ""}
              </Typography>
              <Typography variant="caption" className="block text-muted">
                Needed {formatBookingDateTime(job.requestedAt)}
                {formatRelativeTime(job.requestedAt)
                  ? ` · ${formatRelativeTime(job.requestedAt)}`
                  : ""}
              </Typography>
            </div>
            <span className="inline-flex items-center gap-1 text-[length:var(--text-sm)] font-medium text-primary">
              Open
              <ChevronRight className="h-4 w-4" aria-hidden />
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
