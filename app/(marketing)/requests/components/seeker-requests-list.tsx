"use client";

import {
  BookingStatusChip,
  Button,
  EmptyState,
  Typography,
} from "@/components/ui";
import type { PrototypeBooking } from "@/lib/prototype-types";

type SeekerRequestsListProps = {
  bookings: PrototypeBooking[];
  seekerName: string;
};

function formatWhen(iso: string) {
  try {
    return new Intl.DateTimeFormat(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

function statusMessage(status: PrototypeBooking["status"]) {
  if (status === "accepted") {
    return "Accepted — the provider will contact you soon.";
  }
  if (status === "declined") {
    return "Declined — you can request another provider or service.";
  }
  return "Pending — waiting for the provider to respond.";
}

export function SeekerRequestsList({
  bookings,
  seekerName,
}: SeekerRequestsListProps) {
  if (bookings.length === 0) {
    return (
      <EmptyState
        title="No requests yet"
        description={`Hi ${seekerName}. When you request a service, you can track its status here.`}
        action={
          <Button as="a" href="/services">
            Browse services
          </Button>
        }
      />
    );
  }

  return (
    <ul className="overflow-hidden rounded-[var(--radius-xl)] border border-border bg-surface divide-y divide-border">
      {bookings.map((booking) => (
        <li
          key={booking.id}
          className="flex flex-col gap-[var(--space-3)] px-[var(--space-5)] py-[var(--space-5)] sm:flex-row sm:items-start sm:justify-between"
        >
          <div className="min-w-0 space-y-1">
            <Typography variant="h4">{booking.serviceTitle}</Typography>
            <Typography variant="caption" className="block text-muted">
              Requested {formatWhen(booking.createdAt)}
            </Typography>
            {booking.location?.address ? (
              <Typography variant="caption" className="block text-muted">
                {booking.location.address}
              </Typography>
            ) : null}
            {booking.note ? (
              <Typography variant="body" className="pt-1 text-muted">
                “{booking.note}”
              </Typography>
            ) : null}
            <Typography variant="body" className="pt-1">
              {statusMessage(booking.status)}
            </Typography>
          </div>
          <BookingStatusChip status={booking.status} />
        </li>
      ))}
    </ul>
  );
}
