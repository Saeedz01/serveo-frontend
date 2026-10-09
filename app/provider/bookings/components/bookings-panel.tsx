"use client";

import { useMemo, useState } from "react";
import {
  Button,
  EmptyState,
  PageHeader,
  Pill,
  Typography,
} from "@/components/ui";
import { usePrototype } from "@/components/prototype/prototype-provider";
import type { BookingStatus } from "@/lib/prototype-types";
import { BookingRequestCard } from "./booking-request-card";

const filters: Array<BookingStatus | "all"> = [
  "all",
  "pending",
  "negotiating",
  "accepted",
  "declined",
];

export function BookingsPanel() {
  const { ready, currentProvider, bookingsForProvider } = usePrototype();
  const [filter, setFilter] = useState<(typeof filters)[number]>("all");

  const bookings = useMemo(() => {
    if (!currentProvider) return [];
    const list = bookingsForProvider(currentProvider.id);
    return filter === "all"
      ? list
      : list.filter((booking) => booking.status === filter);
  }, [bookingsForProvider, currentProvider, filter]);

  if (!ready) {
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

  const openCount = bookingsForProvider(currentProvider.id).filter(
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
          openCount > 0
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
