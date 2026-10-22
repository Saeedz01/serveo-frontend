"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  Button,
  EmptyState,
  PageHeader,
  Pill,
  Typography,
} from "@/components/ui";
import { usePrototype } from "@/components/prototype/prototype-provider";
import type { BookingStatusDto } from "@/service/api";
import {
  useGetProviderBookingsQuery,
  useMarkProviderBookingsSeenMutation,
} from "@/service/api";
import { getAccessToken } from "@/service/splitApiSetting";
import { BookingRequestCard } from "./booking-request-card";

const filters: Array<BookingStatusDto | "all"> = [
  "all",
  "pending",
  "negotiating",
  "accepted",
  "completed",
  "declined",
];

export function BookingsPanel() {
  const { ready, currentProvider } = usePrototype();
  const hasToken = Boolean(getAccessToken());
  const [filter, setFilter] = useState<(typeof filters)[number]>("all");
  const {
    data: apiBookings = [],
    isLoading,
    isFetching,
  } = useGetProviderBookingsQuery(undefined, {
    skip: !ready || !currentProvider || !hasToken,
  });
  const [markSeen] = useMarkProviderBookingsSeenMutation();
  const markAttemptedRef = useRef(new Set<string>());

  // Visiting the Bookings list counts as “seen” for accepted (Booked) items.
  useEffect(() => {
    if (!ready || !currentProvider || !hasToken) return;
    const unseenIds = apiBookings
      .filter(
        (booking) =>
          booking.status === "accepted" &&
          booking.providerViewedAt === null &&
          !markAttemptedRef.current.has(booking.id),
      )
      .map((booking) => booking.id);
    if (unseenIds.length === 0) return;

    for (const id of unseenIds) markAttemptedRef.current.add(id);
    void markSeen({ bookingIds: unseenIds })
      .unwrap()
      .catch(() => {
        for (const id of unseenIds) markAttemptedRef.current.delete(id);
      });
  }, [apiBookings, currentProvider, hasToken, markSeen, ready]);

  const bookings = useMemo(() => {
    return filter === "all"
      ? apiBookings
      : apiBookings.filter((booking) => booking.status === filter);
  }, [apiBookings, filter]);

  if (!ready || isLoading) {
    return <Typography variant="body">Loading bookings...</Typography>;
  }

  if (!currentProvider) {
    return (
      <EmptyState
        title="Provider session required"
        description="Log in as a provider to review booking requests."
        action={
          <div className="flex flex-wrap justify-center gap-3">
            <Button as="a" href="/provider/login">
              Provider login
            </Button>
            <Button as="a" href="/provider/signup" variant="secondary">
              Sign up
            </Button>
          </div>
        }
      />
    );
  }

  if (!hasToken) {
    return (
      <EmptyState
        title="Sign in again"
        description="Your provider session expired. Log in to load booking requests from the server."
        action={
          <Button as="a" href="/provider/login">
            Provider login
          </Button>
        }
      />
    );
  }

  const openCount = apiBookings.filter(
    (booking) =>
      booking.status === "pending" || booking.status === "negotiating",
  ).length;

  return (
    <div className="space-y-[var(--space-6)]">
      <PageHeader
        tone="primary"
        eyebrow="Requests"
        title="Booking requests"
        description={
          isFetching
            ? "Refreshing requests…"
            : openCount > 0
              ? `Open a request to see full details and travel distance. ${openCount} still open.`
              : "Open any request to review details, distance to the job site, then accept or negotiate."
        }
      />

      <div className="flex flex-wrap gap-[var(--space-2)]">
        {filters.map((value) => (
          <Pill
            key={value}
            type="button"
            active={filter === value}
            onClick={() => setFilter(value)}
          >
            {value === "all"
              ? "All"
              : value === "accepted"
                ? "Booked"
                : value === "completed"
                  ? "Completed"
                  : value.charAt(0).toUpperCase() + value.slice(1)}
          </Pill>
        ))}
      </div>

      {bookings.length === 0 ? (
        <EmptyState
          title="No booking requests"
          description="When seekers request your services, they’ll appear here to accept, negotiate, or decline."
          action={
            <Button as="a" href="/provider/services" variant="secondary">
              View my services
            </Button>
          }
        />
      ) : (
        <div className="overflow-hidden rounded-[var(--radius-xl)] border border-border bg-surface">
          <ul className="divide-y divide-border">
            {bookings.map((booking) => (
              <BookingRequestCard key={booking.id} booking={booking} />
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
