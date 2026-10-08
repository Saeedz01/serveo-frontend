"use client";

import { useMemo, useState } from "react";
import {
  BookingStatusChip,
  Button,
  EmptyState,
  PageHeader,
  Pill,
  Typography,
} from "@/components/ui";
import { usePrototype } from "@/components/prototype/prototype-provider";
import type { BookingStatus } from "@/lib/prototype-types";

const filters: Array<BookingStatus | "all"> = [
  "all",
  "pending",
  "accepted",
  "declined",
];

export function BookingsPanel() {
  const {
    ready,
    currentProvider,
    bookingsForProvider,
    acceptBooking,
    declineBooking,
  } = usePrototype();
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

  const pendingCount = bookingsForProvider(currentProvider.id).filter(
    (booking) => booking.status === "pending",
  ).length;

  return (
    <div className="space-y-[var(--space-6)]">
      <PageHeader
        tone="primary"
        eyebrow="Requests"
        title="Booking requests"
        description={
          pendingCount > 0
            ? `Review seeker requests and respond. ${pendingCount} waiting for you.`
            : "Review seeker requests and accept or decline them. You’re all caught up."
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
              : value.charAt(0).toUpperCase() + value.slice(1)}
          </Pill>
        ))}
      </div>

      {bookings.length === 0 ? (
        <EmptyState
          title="No booking requests"
          description="When seekers request your services, they’ll appear here for you to accept or decline."
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
              <li
                key={booking.id}
                className="flex flex-col gap-[var(--space-4)] px-[var(--space-5)] py-[var(--space-5)] transition-colors hover:bg-secondary/40 lg:flex-row lg:items-center lg:justify-between"
              >
                <div className="min-w-0 space-y-1">
                  <Typography variant="h4">{booking.serviceTitle}</Typography>
                  <Typography variant="label" className="block">
                    {booking.seekerName}
                  </Typography>
                  <Typography variant="caption" className="block text-muted">
                    {booking.seekerPhone}
                  </Typography>
                  {booking.location?.address ? (
                    <Typography variant="caption" className="block text-muted">
                      Location: {booking.location.address}
                      {typeof booking.location.lat === "number" &&
                      typeof booking.location.lng === "number"
                        ? ` · ${booking.location.lat.toFixed(4)}, ${booking.location.lng.toFixed(4)}`
                        : ""}
                    </Typography>
                  ) : null}
                  {booking.note ? (
                    <Typography variant="body" className="pt-1 text-muted">
                      “{booking.note}”
                    </Typography>
                  ) : null}
                </div>
                <div className="flex flex-wrap items-center gap-[var(--space-2)]">
                  <BookingStatusChip status={booking.status} />
                  {booking.status === "pending" ? (
                    <>
                      <Button
                        type="button"
                        className="h-9 min-h-9 px-4 text-[length:var(--text-sm)]"
                        onClick={() => acceptBooking(booking.id)}
                      >
                        Accept
                      </Button>
                      <Button
                        type="button"
                        variant="secondary"
                        className="h-9 min-h-9 px-4 text-[length:var(--text-sm)] border-error text-error hover:bg-red-50"
                        onClick={() => declineBooking(booking.id)}
                      >
                        Decline
                      </Button>
                    </>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
