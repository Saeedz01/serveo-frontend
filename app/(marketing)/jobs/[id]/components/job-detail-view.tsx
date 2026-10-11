"use client";

import { useState } from "react";
import {
  Button,
  Container,
  EmptyState,
  PageHeader,
  Typography,
} from "@/components/ui";
import { usePrototype } from "@/components/prototype/prototype-provider";
import { formatBookingDateTime } from "@/lib/prototype-bookings";
import { JobBidsPanel } from "./job-bids-panel";

type JobDetailViewProps = {
  jobId: string;
};

function statusLabel(status: string) {
  if (status === "awarded") return "Awarded";
  if (status === "closed") return "Closed";
  return "Open for bids";
}

export function JobDetailView({ jobId }: JobDetailViewProps) {
  const {
    ready,
    currentSeeker,
    getJobPost,
    bidsForJob,
    acceptJobBid,
    closeJobPost,
  } = usePrototype();
  const [closeError, setCloseError] = useState("");
  const [closing, setClosing] = useState(false);

  if (!ready) {
    return (
      <Container className="py-[var(--space-8)]">
        <Typography variant="body">Loading job...</Typography>
      </Container>
    );
  }

  const job = getJobPost(jobId);
  if (!job) {
    return (
      <Container className="py-[var(--space-8)]">
        <EmptyState
          title="Job not found"
          description="This job may have been removed or the link is incorrect."
          action={
            <Button as="a" href="/jobs/new">
              Post a job
            </Button>
          }
        />
      </Container>
    );
  }

  const bids = bidsForJob(job.id);
  const phoneKey = (currentSeeker?.phone ?? "").replace(/[^\d+]/g, "");
  const jobPhone = job.seekerPhone.replace(/[^\d+]/g, "");
  const isOwner =
    Boolean(currentSeeker) &&
    ((job.seekerId && job.seekerId === currentSeeker?.id) ||
      (phoneKey.length > 0 && phoneKey === jobPhone));

  const handleClose = () => {
    setCloseError("");
    setClosing(true);
    const result = closeJobPost(job.id);
    setClosing(false);
    if (!result.ok) setCloseError(result.reason);
  };

  return (
    <Container className="py-[var(--space-6)] lg:py-[var(--space-8)]">
      <div className="mb-[var(--space-6)]">
        <PageHeader
          tone="primary"
          eyebrow={statusLabel(job.status)}
          title={job.title}
          description={job.description}
          actions={
            <div className="flex flex-wrap gap-[var(--space-2)]">
              {isOwner && job.status === "open" ? (
                <Button
                  type="button"
                  variant="secondary"
                  disabled={closing}
                  onClick={handleClose}
                >
                  {closing ? "Closing..." : "Close job"}
                </Button>
              ) : null}
              <Button as="a" href="/requests" variant="secondary">
                My requests
              </Button>
            </div>
          }
        />
      </div>

      <div className="mb-[var(--space-6)] space-y-1 rounded-[var(--radius-xl)] border border-border bg-surface p-[var(--space-5)]">
        <Typography variant="caption" className="block text-muted">
          Posted {formatBookingDateTime(job.createdAt)} by {job.seekerName}
        </Typography>
        <Typography variant="body">{job.location.address}</Typography>
        {job.status === "closed" ? (
          <Typography variant="body" className="pt-2 text-muted">
            This job is closed and no longer shown to providers.
          </Typography>
        ) : null}
        {job.status === "awarded" && job.awardedBookingId ? (
          <Typography variant="body" className="pt-2">
            Awarded — track the booking in{" "}
            <a href="/requests" className="font-medium text-primary underline">
              My requests
            </a>
            .
          </Typography>
        ) : null}
        {closeError ? (
          <Typography variant="caption" className="block text-error">
            {closeError}
          </Typography>
        ) : null}
      </div>

      {!isOwner && job.status === "open" ? (
        <Typography variant="caption" className="mb-[var(--space-4)] block text-muted">
          Posted this job?{" "}
          <a href="/requests" className="font-medium text-primary underline">
            Look up your phone in My requests
          </a>{" "}
          to accept bids.
        </Typography>
      ) : null}

      <JobBidsPanel
        job={job}
        bids={bids}
        canAccept={Boolean(isOwner && job.status === "open")}
        onAccept={(bidId) => acceptJobBid(job.id, bidId)}
      />
    </Container>
  );
}
