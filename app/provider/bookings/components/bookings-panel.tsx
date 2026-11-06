"use client";

import { useMemo, useState } from "react";
import {
  Button,
  EmptyState,
  PageHeader,
  Pill,
  ProviderListSkeleton,
} from "@/components/ui";
import { usePrototype } from "@/components/prototype/prototype-provider";
import type { BookingStatusDto } from "@/service/api";
import { useGetProviderBookingsQuery } from "@/service/api";
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
  const { data: apiBookings = [], isLoading } = useGetProviderBookingsQuery(
    undefined,
    {
      skip: !ready || !currentProvider || !hasToken,
      refetchOnFocus: false,
    },
  );

  const bookings = useMemo(() => {
    return filter === "all"
      ? apiBookings
      : apiBookings.filter((booking) => booking.status === filter);
  }, [apiBookings, filter]);

  if (!currentProvider && ready) {
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

  if (ready && currentProvider && !hasToken) {
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
  const listLoading = !ready || isLoading;

  return (
    <div className="space-y-[var(--space-6)]">
      <PageHeader
        tone="primary"
        eyebrow="Requests"
        title="Booking requests"
        description={
          listLoading
            ? "Open a request to see full details and travel distance."
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
            disabled={listLoading}
          >
            {value === "all"
              ? "All"
              : value === "accepted"
                ? "Confirmed"
                : value === "completed"
                  ? "Completed"
                  : value.charAt(0).toUpperCase() + value.slice(1)}
          </Pill>
        ))}
      </div>

      {listLoading ? (
        <ProviderListSkeleton rows={5} />
      ) : bookings.length === 0 ? (
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
