"use client";

import Link from "next/link";
import { Button, EmptyState, Typography } from "@/components/ui";
import { formatBookingDateTime } from "@/lib/prototype-bookings";
import type { PrototypeJobPost } from "@/lib/prototype-types";

type SeekerJobPostsProps = {
  jobs: PrototypeJobPost[];
};

function jobStatusLabel(status: PrototypeJobPost["status"]) {
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
                {jobStatusLabel(job.status)} · {job.location.address}
              </Typography>
            </div>
            <Typography
              variant="caption"
              className="shrink-0 text-muted sm:pt-1"
            >
              {formatBookingDateTime(job.createdAt)}
            </Typography>
          </Link>
        </li>
      ))}
    </ul>
  );
}
