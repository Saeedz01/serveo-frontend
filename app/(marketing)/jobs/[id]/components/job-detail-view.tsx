"use client";

import { useState } from "react";
import {
  Button,
  Container,
  EmptyState,
  PageHeader,
  Typography,
  useToast,
} from "@/components/ui";
import { usePrototype } from "@/components/prototype/prototype-provider";
import {
  formatBookingDateTime,
  formatRelativeTime,
} from "@/lib/prototype-bookings";
import {
  useAcceptBiddingMutation,
  useCloseJobMutation,
  useGetJobBiddingsQuery,
  useGetJobQuery,
} from "@/service/api";
import {
  getApiErrorMessage,
  getStoredAuthUser,
} from "@/service/auth-session";
import { getAccessToken } from "@/service/splitApiSetting";
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
  const { ready } = usePrototype();
  const { pushToast } = useToast();
  const authUser = getStoredAuthUser();
  const hasToken = Boolean(getAccessToken());
  const seekerLoggedIn = authUser?.role === "SEEKER" && hasToken;

  const {
    data: job,
    isLoading,
    isError,
  } = useGetJobQuery(jobId, {
    skip: !ready || !seekerLoggedIn,
  });

  const {
    data: bids = [],
    isLoading: bidsLoading,
  } = useGetJobBiddingsQuery(jobId, {
    skip: !ready || !seekerLoggedIn || !job,
  });

  const [closeJob, { isLoading: closing }] = useCloseJobMutation();
  const [acceptBidding, { isLoading: accepting }] = useAcceptBiddingMutation();
  const [acceptingBidId, setAcceptingBidId] = useState<string | null>(null);
  const [closeError, setCloseError] = useState("");

  const isOwner =
    seekerLoggedIn && job != null && job.seekerId === authUser?.id;

  // Live bid updates come from SeekerRealtimeSync (seeker socket room).

  if (!ready || (seekerLoggedIn && isLoading)) {
    return (
      <Container className="py-[var(--space-8)]">
        <Typography variant="body">Loading job...</Typography>
      </Container>
    );
  }

  if (!seekerLoggedIn) {
    return (
      <Container className="py-[var(--space-8)]">
        <EmptyState
          title="Sign in to view this job"
          description="Log in as the seeker who posted this job to see bids and manage the post."
          action={
            <Button as="a" href="/seeker/login">
              Seeker login
            </Button>
          }
        />
      </Container>
    );
  }

  if (isError || !job) {
    return (
      <Container className="py-[var(--space-8)]">
        <EmptyState
          title="Job not found"
          description="This job may have been removed, or it belongs to another account."
          action={
            <Button as="a" href="/seeker/dashboard?tab=jobs">
              My jobs
            </Button>
          }
        />
      </Container>
    );
  }

  const handleClose = async () => {
    setCloseError("");
    try {
      await closeJob(job.id).unwrap();
      pushToast({
        tone: "success",
        title: "Job closed",
        description: "Providers can no longer bid on this post.",
      });
    } catch (error) {
      const message = getApiErrorMessage(error, "Could not close this job.");
      setCloseError(message);
    }
  };

  const handleAcceptBid = async (bidId: string) => {
    setAcceptingBidId(bidId);
    try {
      const result = await acceptBidding({ bidId, jobId }).unwrap();
      pushToast({
        tone: "success",
        title: "Bid accepted",
        description: `${result.bid.providerName} is booked. They’ve been notified.`,
      });
    } catch (error) {
      pushToast({
        tone: "error",
        title: "Could not accept bid",
        description: getApiErrorMessage(error, "Try again."),
      });
    } finally {
      setAcceptingBidId(null);
    }
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
                  onClick={() => {
                    void handleClose();
                  }}
                >
                  {closing ? "Closing..." : "Close job"}
                </Button>
              ) : null}
              <Button as="a" href="/seeker/dashboard?tab=jobs" variant="secondary">
                My jobs
              </Button>
            </div>
          }
        />
      </div>

      <div className="mb-[var(--space-6)] space-y-1 rounded-[var(--radius-xl)] border border-border bg-surface p-[var(--space-5)]">
        <Typography variant="caption" className="block text-muted">
          Needed {formatBookingDateTime(job.requestedAt)}
          {formatRelativeTime(job.requestedAt)
            ? ` · ${formatRelativeTime(job.requestedAt)}`
            : ""}
        </Typography>
        <Typography variant="caption" className="block text-muted">
          Posted {formatBookingDateTime(job.createdAt)} by {job.seekerName}
        </Typography>
        <Typography variant="body">{job.address}</Typography>
        {job.status === "closed" ? (
          <Typography variant="body" className="pt-2 text-muted">
            This job is closed and no longer shown to providers.
          </Typography>
        ) : null}
        {closeError ? (
          <Typography variant="caption" className="block text-error">
            {closeError}
          </Typography>
        ) : null}
      </div>

      {!isOwner && job.status === "open" ? (
        <Typography
          variant="caption"
          className="mb-[var(--space-4)] block text-muted"
        >
          Posted this job?{" "}
          <a
            href="/seeker/dashboard?tab=jobs"
            className="font-medium text-primary underline"
          >
            Open your dashboard
          </a>{" "}
          to review bids.
        </Typography>
      ) : null}

      <JobBidsPanel
        job={job}
        bids={bids}
        loading={bidsLoading}
        canAccept={isOwner}
        acceptingBidId={accepting ? acceptingBidId : null}
        onAcceptBid={(bidId) => {
          void handleAcceptBid(bidId);
        }}
      />
    </Container>
  );
}
