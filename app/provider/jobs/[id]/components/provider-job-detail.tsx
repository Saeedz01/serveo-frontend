"use client";

import {
  CalendarClock,
  MapPin,
  NotebookPen,
  Tag,
  UserRound,
} from "lucide-react";
import {
  Button,
  EmptyState,
  PageHeader,
  Typography,
} from "@/components/ui";
import { usePrototype } from "@/components/prototype/prototype-provider";
import { BookingTripPanel } from "@/app/provider/bookings/[id]/components/booking-trip-panel";
import {
  formatBookingDateTime,
  formatRelativeTime,
} from "@/lib/prototype-bookings";
import { useGetJobQuery, useGetMyBiddingOnJobQuery } from "@/service/api";
import { getAccessToken } from "@/service/splitApiSetting";
import { ProviderBidForm } from "./provider-bid-form";

type ProviderJobDetailProps = {
  jobId: string;
};

export function ProviderJobDetail({ jobId }: ProviderJobDetailProps) {
  const { ready, currentProvider, servicesForProvider } = usePrototype();
  const hasToken = Boolean(getAccessToken());
  const {
    data: job,
    isLoading,
    isError,
  } = useGetJobQuery(jobId, {
    skip: !ready || !currentProvider || !hasToken,
  });
  const { data: myBid, isLoading: bidLoading } = useGetMyBiddingOnJobQuery(
    jobId,
    {
      skip: !ready || !currentProvider || !hasToken,
    },
  );
  const hasMyBid = Boolean(myBid);

  if (!ready || isLoading || bidLoading) {
    return <Typography variant="body">Loading job...</Typography>;
  }

  if (!currentProvider) {
    return (
      <EmptyState
        title="Provider session required"
        description="Log in to view this job and place a bid."
        action={
          <Button as="a" href="/provider/login">
            Provider login
          </Button>
        }
      />
    );
  }

  if (!hasToken) {
    return (
      <EmptyState
        title="Session expired"
        description="Sign in again to view this job."
        action={
          <Button as="a" href="/provider/login">
            Provider login
          </Button>
        }
      />
    );
  }

  if (isError || !job || job.status !== "open") {
    return (
      <EmptyState
        title="Job unavailable"
        description="This job is closed, awarded, or outside your published service categories."
        action={
          <Button as="a" href="/provider/jobs">
            Back to open jobs
          </Button>
        }
      />
    );
  }

  const canBid = currentProvider.status === "verified" && !hasMyBid;
  const services = servicesForProvider(currentProvider.id).filter(
    (service) => service.status === "published",
  );
  const baseService =
    services.find((service) => service.categoryId === job.categoryId) ??
    services[0];

  const origin = {
    lat: baseService?.lat ?? job.lat,
    lng: baseService?.lng ?? job.lng,
    label: baseService?.address ?? "Your service base",
  };
  const destination = {
    lat: job.lat,
    lng: job.lng,
    label: job.address,
  };
  const neededAbsolute = formatBookingDateTime(job.requestedAt);
  const neededRelative = formatRelativeTime(job.requestedAt);
  const postedAbsolute = formatBookingDateTime(job.createdAt);

  return (
    <div className="mx-auto w-full max-w-5xl space-y-[var(--space-6)]">
      <PageHeader
        tone="primary"
        eyebrow="Open job"
        title={job.title}
        description={job.description}
        actions={
          <Button as="a" href="/provider/jobs" variant="secondary">
            All jobs
          </Button>
        }
      />

      <div className="grid gap-[var(--space-5)] lg:grid-cols-[1.05fr_0.95fr] lg:items-start">
        <section className="space-y-[var(--space-4)] rounded-[var(--radius-xl)] border border-border bg-surface p-[var(--space-5)]">
          <Typography variant="h3">Job details</Typography>

          <dl className="space-y-[var(--space-4)]">
            <div className="flex gap-[var(--space-3)]">
              <Tag
                className="mt-0.5 h-4 w-4 shrink-0 text-primary"
                aria-hidden
              />
              <div>
                <Typography variant="caption" className="mb-1 block text-muted">
                  Category
                </Typography>
                <Typography variant="body">{job.categoryName}</Typography>
              </div>
            </div>

            <div className="flex gap-[var(--space-3)]">
              <UserRound
                className="mt-0.5 h-4 w-4 shrink-0 text-primary"
                aria-hidden
              />
              <div>
                <Typography variant="caption" className="mb-1 block text-muted">
                  Posted by
                </Typography>
                <Typography variant="label" className="block">
                  {job.seekerName}
                </Typography>
              </div>
            </div>

            <div className="flex gap-[var(--space-3)]">
              <CalendarClock
                className="mt-0.5 h-4 w-4 shrink-0 text-primary"
                aria-hidden
              />
              <div>
                <Typography variant="caption" className="mb-1 block text-muted">
                  Needed at
                </Typography>
                <Typography variant="body">{neededAbsolute}</Typography>
                {neededRelative ? (
                  <span className="mt-2 inline-flex items-center rounded-[var(--radius-full)] bg-primary px-3 py-1 text-[length:var(--text-sm)] font-semibold text-primary-foreground">
                    {neededRelative}
                  </span>
                ) : null}
                <Typography variant="caption" className="mt-2 block text-muted">
                  Posted {postedAbsolute}
                </Typography>
              </div>
            </div>

            <div className="flex gap-[var(--space-3)]">
              <MapPin
                className="mt-0.5 h-4 w-4 shrink-0 text-primary"
                aria-hidden
              />
              <div>
                <Typography variant="caption" className="mb-1 block text-muted">
                  Job location
                </Typography>
                <Typography variant="body">{job.address}</Typography>
                <Typography variant="caption" className="mt-1 block text-muted">
                  {job.lat.toFixed(5)}, {job.lng.toFixed(5)}
                </Typography>
              </div>
            </div>

            {job.description ? (
              <div className="flex gap-[var(--space-3)]">
                <NotebookPen
                  className="mt-0.5 h-4 w-4 shrink-0 text-primary"
                  aria-hidden
                />
                <div>
                  <Typography
                    variant="caption"
                    className="mb-1 block text-muted"
                  >
                    What they need
                  </Typography>
                  <Typography variant="body">{job.description}</Typography>
                </div>
              </div>
            ) : null}
          </dl>

          <Typography variant="caption" className="block text-muted">
            This job stays open until the seeker awards a bid or closes it.
          </Typography>

          {currentProvider.status !== "verified" ? (
            <EmptyState
              title="Verification required"
              description="Only verified providers can bid on job posts."
            />
          ) : hasMyBid && myBid ? (
            <div className="space-y-[var(--space-3)] rounded-[var(--radius-lg)] border border-border bg-secondary/40 p-[var(--space-4)]">
              <Typography variant="h4">Your bid</Typography>
              <Typography variant="body" className="font-semibold">
                ${myBid.price.toFixed(0)}
              </Typography>
              {myBid.note ? (
                <Typography variant="body" className="text-muted">
                  “{myBid.note}”
                </Typography>
              ) : null}
              <Typography variant="caption" className="block text-muted">
                {myBid.status === "accepted"
                  ? "Accepted — this job is booked. Check Bookings → Booked."
                  : myBid.status === "rejected"
                    ? "Not selected — the seeker accepted another bid."
                    : "Waiting for the seeker to accept. You cannot place another bid while this one is pending."}
              </Typography>
            </div>
          ) : canBid ? (
            <ProviderBidForm jobId={job.id} />
          ) : null}
        </section>

        <div className="lg:sticky lg:top-6 lg:self-start">
          {baseService ? (
            <BookingTripPanel origin={origin} destination={destination} />
          ) : (
            <section className="space-y-[var(--space-4)] rounded-[var(--radius-xl)] border border-border bg-surface p-[var(--space-5)]">
              <Typography variant="h3">Travel to job site</Typography>
              <Typography variant="body" className="text-muted">
                Publish a service in this category to see distance and travel
                time from your base to this job.
              </Typography>
              <Typography variant="body">{job.address}</Typography>
              <Button as="a" href="/provider/services/new" variant="secondary">
                Create a service
              </Button>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
