"use client";

import { useMemo, useState } from "react";
import {
  CalendarClock,
  Layers,
  MapPin,
  Phone,
  UserRound,
} from "lucide-react";
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

function initialsFromName(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return `${parts[0]![0] ?? ""}${parts[1]![0] ?? ""}`.toUpperCase();
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

  const acceptedBid = useMemo(
    () => bids.find((bid) => bid.status === "accepted") ?? null,
    [bids],
  );

  const winningProvider = useMemo(() => {
    if (job?.awardedProvider) return job.awardedProvider;
    if (!acceptedBid) return null;
    return {
      id: acceptedBid.providerId,
      name: acceptedBid.providerName,
      phone: null as string | null,
      bidPrice: acceptedBid.price,
      bookingId: null as string | null,
    };
  }, [acceptedBid, job?.awardedProvider]);

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

  const neededRelative = formatRelativeTime(job.requestedAt);
  const showWinner = Boolean(
    isOwner && job.status === "awarded" && winningProvider,
  );

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

      <section className="mb-[var(--space-6)] overflow-hidden rounded-[var(--radius-xl)] border border-border/80 bg-surface shadow-[0_18px_44px_-34px_rgba(10,10,10,0.4)]">
        <div className="grid gap-0 sm:grid-cols-2">
          <div className="flex items-start gap-3 border-b border-border/70 px-[var(--space-5)] py-[var(--space-4)] sm:border-r">
            <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-[var(--radius-lg)] bg-primary-soft text-primary">
              <CalendarClock className="h-4 w-4" aria-hidden />
            </span>
            <div className="min-w-0">
              <Typography
                variant="caption"
                className="mb-1 block font-semibold tracking-wide text-muted uppercase"
              >
                Needed
              </Typography>
              {neededRelative ? (
                <Typography variant="h4" className="tracking-tight">
                  {neededRelative}
                </Typography>
              ) : null}
              <Typography variant="caption" className="mt-0.5 block text-muted">
                {formatBookingDateTime(job.requestedAt)}
              </Typography>
            </div>
          </div>

          <div className="flex items-start gap-3 border-b border-border/70 px-[var(--space-5)] py-[var(--space-4)]">
            <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-[var(--radius-lg)] bg-secondary text-foreground/70">
              <UserRound className="h-4 w-4" aria-hidden />
            </span>
            <div className="min-w-0">
              <Typography
                variant="caption"
                className="mb-1 block font-semibold tracking-wide text-muted uppercase"
              >
                Posted by
              </Typography>
              <Typography variant="h4" className="truncate tracking-tight">
                {job.seekerName}
              </Typography>
              <Typography variant="caption" className="mt-0.5 block text-muted">
                {formatBookingDateTime(job.createdAt)}
              </Typography>
            </div>
          </div>
        </div>

        <div className="flex items-start gap-3 border-b border-border/70 px-[var(--space-5)] py-[var(--space-4)]">
          <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-[var(--radius-lg)] bg-secondary text-foreground/70">
            <MapPin className="h-4 w-4" aria-hidden />
          </span>
          <div className="min-w-0">
            <Typography
              variant="caption"
              className="mb-1 block font-semibold tracking-wide text-muted uppercase"
            >
              Location
            </Typography>
            <Typography variant="body" className="text-foreground/90">
              {job.address}
            </Typography>
          </div>
        </div>

        {job.categoryName ? (
          <div className="flex items-start gap-3 px-[var(--space-5)] py-[var(--space-4)]">
            <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-[var(--radius-lg)] bg-secondary text-foreground/70">
              <Layers className="h-4 w-4" aria-hidden />
            </span>
            <div className="min-w-0">
              <Typography
                variant="caption"
                className="mb-1 block font-semibold tracking-wide text-muted uppercase"
              >
                Category
              </Typography>
              <Typography variant="label" className="block">
                {job.categoryName}
                {job.specialty ? (
                  <span className="font-normal text-muted">
                    {" "}
                    · {job.specialty}
                  </span>
                ) : null}
              </Typography>
            </div>
          </div>
        ) : null}

        {showWinner && winningProvider ? (
          <div className="border-t border-emerald-200/80 bg-gradient-to-br from-emerald-50/80 via-surface to-primary-soft/30 px-[var(--space-5)] py-[var(--space-5)]">
            <Typography
              variant="caption"
              className="mb-[var(--space-3)] block font-semibold tracking-wide text-success uppercase"
            >
              Accepted bid · provider contact
            </Typography>
            <div className="flex flex-col gap-[var(--space-4)] sm:flex-row sm:items-center sm:justify-between">
              <div className="flex min-w-0 items-start gap-3">
                <span
                  className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-[var(--radius-full)] bg-primary text-[length:var(--text-sm)] font-semibold tracking-wide text-primary-foreground"
                  aria-hidden
                >
                  {initialsFromName(winningProvider.name)}
                </span>
                <div className="min-w-0 space-y-1">
                  <Typography variant="h4" className="truncate tracking-tight">
                    {winningProvider.name}
                  </Typography>
                  <Typography
                    variant="body"
                    className="font-semibold text-primary"
                  >
                    ${winningProvider.bidPrice.toFixed(0)} accepted
                  </Typography>
                  {winningProvider.phone ? (
                    <a
                      href={`tel:${winningProvider.phone}`}
                      className="inline-flex items-center gap-2 text-[length:var(--text-sm)] font-semibold text-foreground hover:text-primary"
                    >
                      <Phone className="h-4 w-4 text-primary" aria-hidden />
                      {winningProvider.phone}
                    </a>
                  ) : (
                    <Typography variant="caption" className="block text-muted">
                      Phone will appear once the provider contact is available.
                    </Typography>
                  )}
                </div>
              </div>
              {winningProvider.phone ? (
                <Button
                  as="a"
                  href={`tel:${winningProvider.phone}`}
                  className="w-full sm:w-auto"
                >
                  <Phone className="h-4 w-4" aria-hidden />
                  Call provider
                </Button>
              ) : null}
            </div>
          </div>
        ) : null}

        {job.status === "closed" ? (
          <div className="border-t border-border/70 px-[var(--space-5)] py-[var(--space-4)]">
            <Typography variant="body" className="text-muted">
              This job is closed and no longer shown to providers.
            </Typography>
          </div>
        ) : null}
        {closeError ? (
          <div className="border-t border-border/70 px-[var(--space-5)] py-[var(--space-3)]">
            <Typography variant="caption" className="block text-error">
              {closeError}
            </Typography>
          </div>
        ) : null}
      </section>

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
