"use client";

import { useState } from "react";
import {
  Button,
  Container,
  EmptyState,
  PageHeader,
  ProviderListSkeleton,
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
        <div className="space-y-[var(--space-6)]">
          <PageHeader
            tone="primary"
            eyebrow="Job post"
            title="Job details"
            description="Review your post and manage bids from providers."
          />
          <ProviderListSkeleton rows={4} />
        </div>
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
              Your posted jobs
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
        description: `${result.bid.providerName} is confirmed. They’ve been notified.`,
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
                Your posted jobs
              </Button>
            </div>
          }
        />
      </div>

      <div className="mb-[var(--space-6)] space-y-[var(--space-4)] rounded-[var(--radius-xl)] border border-border/80 bg-surface p-[var(--space-5)] shadow-[0_14px_36px_-30px_rgba(10,10,10,0.28)]">
        <div className="grid gap-[var(--space-4)] sm:grid-cols-2">
          <div>
            <Typography
              variant="caption"
              className="mb-1 block font-semibold tracking-wide text-muted uppercase"
            >
              Needed
            </Typography>
            {formatRelativeTime(job.requestedAt) ? (
              <Typography variant="label" className="block">
                {formatRelativeTime(job.requestedAt)}
              </Typography>
            ) : null}
            <Typography variant="caption" className="block text-muted">
              {formatBookingDateTime(job.requestedAt)}
            </Typography>
          </div>
          <div>
            <Typography
              variant="caption"
              className="mb-1 block font-semibold tracking-wide text-muted uppercase"
            >
              Posted
            </Typography>
            <Typography variant="label" className="block">
              {job.seekerName}
            </Typography>
            <Typography variant="caption" className="block text-muted">
              {formatBookingDateTime(job.createdAt)}
            </Typography>
          </div>
        </div>
        <div>
          <Typography
            variant="caption"
            className="mb-1 block font-semibold tracking-wide text-muted uppercase"
          >
            Location
          </Typography>
          <Typography variant="body" className="text-foreground/85">
            {job.address}
          </Typography>
        </div>
        {job.categoryName ? (
          <Typography variant="caption" className="block text-muted">
            Category · {job.categoryName}
            {job.specialty ? ` · ${job.specialty}` : ""}
          </Typography>
        ) : null}
        {job.status === "closed" ? (
          <Typography variant="body" className="text-muted">
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
