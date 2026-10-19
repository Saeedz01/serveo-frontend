"use client";

import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
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
import { isSeekerAccount } from "@/lib/prototype-types";
import {
  joinJobBiddingRoom,
  leaveJobBiddingRoom,
  onBidCreated,
  onBidsUpdated,
  upsertBidSorted,
} from "@/lib/realtime/bidding-socket";
import type { BiddingDto } from "@/service/api";
import {
  biddingApi,
  useAcceptBiddingMutation,
  useCloseJobMutation,
  useGetJobBiddingsQuery,
  useGetJobQuery,
  useGuestLookupJobBiddingsMutation,
} from "@/service/api";
import {
  getApiErrorMessage,
  getStoredAuthUser,
} from "@/service/auth-session";
import { getAccessToken } from "@/service/splitApiSetting";
import type { AppDispatch } from "@/service/store";
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
  const dispatch = useDispatch<AppDispatch>();
  const { ready, currentSeeker } = usePrototype();
  const { pushToast } = useToast();
  const authUser = getStoredAuthUser();
  const hasToken = Boolean(getAccessToken());
  const token = getAccessToken();
  const accountSeeker = authUser?.role === "SEEKER" && hasToken;
  const guestSeeker =
    Boolean(currentSeeker) &&
    !isSeekerAccount(currentSeeker) &&
    !accountSeeker;

  const {
    data: job,
    isLoading,
    isError,
  } = useGetJobQuery(jobId, {
    skip: !ready || !accountSeeker,
  });

  const {
    data: accountBids = [],
    isLoading: accountBidsLoading,
  } = useGetJobBiddingsQuery(jobId, {
    skip: !ready || !accountSeeker || !job,
  });

  const [guestBids, setGuestBids] = useState<BiddingDto[] | null>(null);
  const [guestLookupBids, { isLoading: guestBidsLoading }] =
    useGuestLookupJobBiddingsMutation();
  const [closeJob, { isLoading: closing }] = useCloseJobMutation();
  const [acceptBidding, { isLoading: accepting }] = useAcceptBiddingMutation();
  const [acceptingBidId, setAcceptingBidId] = useState<string | null>(null);
  const [closeError, setCloseError] = useState("");

  useEffect(() => {
    if (!ready || !guestSeeker || !currentSeeker || accountSeeker) return;

    let cancelled = false;
    void guestLookupBids({
      jobId,
      body: { phone: currentSeeker.phone, name: currentSeeker.name },
    })
      .unwrap()
      .then((bids) => {
        if (!cancelled) setGuestBids(bids);
      })
      .catch(() => {
        if (!cancelled) setGuestBids([]);
      });

    return () => {
      cancelled = true;
    };
  }, [
    accountSeeker,
    currentSeeker,
    guestLookupBids,
    guestSeeker,
    jobId,
    ready,
  ]);

  // Live bid updates via Socket.io (account seeker or guest owner).
  useEffect(() => {
    if (!ready) return;

    const canWatchAccount =
      accountSeeker && Boolean(job) && job?.seekerId === authUser?.id;
    const canWatchGuest = guestSeeker && Boolean(currentSeeker);
    if (!canWatchAccount && !canWatchGuest) return;

    const auth =
      canWatchAccount && token
        ? { token }
        : {
            phone: currentSeeker!.phone,
            name: currentSeeker!.name,
          };

    let active = true;
    void joinJobBiddingRoom(jobId, auth);

    const unsubCreated = onBidCreated((bid) => {
      if (!active || bid.jobId !== jobId) return;

      if (accountSeeker) {
        dispatch(
          biddingApi.util.updateQueryData("getJobBiddings", jobId, (draft) => {
            const next = upsertBidSorted(draft, bid);
            draft.splice(0, draft.length, ...next);
          }),
        );
      } else {
        setGuestBids((prev) => upsertBidSorted(prev ?? [], bid));
      }

      pushToast({
        tone: "success",
        title: "New bid",
        description: `${bid.providerName} offered $${bid.price.toFixed(0)}.`,
      });
    });

    const unsubUpdated = onBidsUpdated((nextBids) => {
      if (!active) return;
      if (accountSeeker) {
        dispatch(
          biddingApi.util.updateQueryData("getJobBiddings", jobId, (draft) => {
            draft.splice(0, draft.length, ...nextBids);
          }),
        );
      } else {
        setGuestBids(nextBids);
      }
    });

    return () => {
      active = false;
      unsubCreated();
      unsubUpdated();
      leaveJobBiddingRoom(jobId);
    };
  }, [
    accountSeeker,
    authUser?.id,
    currentSeeker,
    dispatch,
    guestSeeker,
    job,
    jobId,
    pushToast,
    ready,
    token,
  ]);

  if (!ready || (accountSeeker && isLoading)) {
    return (
      <Container className="py-[var(--space-8)]">
        <Typography variant="body">Loading job...</Typography>
      </Container>
    );
  }

  if (!accountSeeker && !guestSeeker) {
    return (
      <Container className="py-[var(--space-8)]">
        <EmptyState
          title="Sign in to view this job"
          description="Log in as the seeker who posted this job to see bids, or look up your guest session from the dashboard."
          action={
            <div className="flex flex-wrap justify-center gap-3">
              <Button as="a" href="/seeker/login">
                Seeker login
              </Button>
              <Button as="a" href="/seeker/dashboard?tab=jobs" variant="secondary">
                Dashboard
              </Button>
            </div>
          }
        />
      </Container>
    );
  }

  // Logged-in seekers load job via API. Guests only see bids for jobs they own
  // (guest-lookup); job metadata comes from the dashboard list / close flow later.
  if (accountSeeker && (isError || !job)) {
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

  const bids = accountSeeker ? accountBids : (guestBids ?? []);
  const bidsLoading = accountSeeker
    ? accountBidsLoading
    : guestBids === null || guestBidsLoading;

  const handleClose = async () => {
    if (!job) return;
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
      const result = await acceptBidding({
        bidId,
        jobId,
        body:
          guestSeeker && currentSeeker
            ? { phone: currentSeeker.phone, name: currentSeeker.name }
            : {},
      }).unwrap();

      if (guestSeeker) {
        setGuestBids((prev) =>
          (prev ?? []).map((bid) => {
            if (bid.id === result.bid.id) return result.bid;
            if (bid.status === "pending") {
              return { ...bid, status: "rejected" as const };
            }
            return bid;
          }),
        );
      }

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

  if (guestSeeker && !job) {
    return (
      <Container className="py-[var(--space-6)] lg:py-[var(--space-8)]">
        <div className="mb-[var(--space-6)]">
          <PageHeader
            tone="primary"
            eyebrow="Job bids"
            title="Bids on your job"
            description="Offers from providers for this post."
            actions={
              <Button as="a" href="/seeker/dashboard?tab=jobs" variant="secondary">
                My jobs
              </Button>
            }
          />
        </div>
        <JobBidsPanel
          job={{
            id: jobId,
            categoryId: "",
            categoryName: "",
            categorySlug: "",
            seekerId: null,
            seekerName: currentSeeker?.name ?? "",
            seekerPhone: currentSeeker?.phone ?? "",
            title: "Your job",
            description: "",
            address: "",
            lat: 0,
            lng: 0,
            requestedAt: new Date().toISOString(),
            status: bids.some((bid) => bid.status === "accepted")
              ? "awarded"
              : "open",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          }}
          bids={bids}
          loading={bidsLoading}
          canAccept={guestSeeker}
          acceptingBidId={accepting ? acceptingBidId : null}
          onAcceptBid={(bidId) => {
            void handleAcceptBid(bidId);
          }}
        />
      </Container>
    );
  }

  if (!job) {
    return null;
  }

  const isOwner =
    (accountSeeker && job.seekerId === authUser?.id) ||
    (guestSeeker &&
      Boolean(currentSeeker) &&
      job.seekerPhone.replace(/\D/g, "") ===
        (currentSeeker?.phone ?? "").replace(/\D/g, ""));

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
              {isOwner && accountSeeker && job.status === "open" ? (
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
