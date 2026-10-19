"use client";

import { useState } from "react";
import {
  BookingStatusChip,
  Button,
  EmptyState,
  Typography,
  useToast,
} from "@/components/ui";
import {
  formatBookingDateTime,
  formatRelativeTime,
} from "@/lib/prototype-bookings";
import type { BookingDto, BookingStatusDto } from "@/service/api";
import { useWithdrawBookingMutation } from "@/service/api";
import { getApiErrorMessage } from "@/service/auth-session";

type SeekerRequestsListProps = {
  bookings: BookingDto[];
  seekerName: string;
  /** When set, withdraw as guest (phone required). Omit for JWT seeker. */
  guestIdentity?: { phone: string; name?: string } | null;
  /** After a guest withdraw, parent should drop the booking from local list. */
  onWithdrawn?: (bookingId: string) => void;
};

function statusMessage(status: BookingStatusDto) {
  if (status === "accepted") {
    return "Booked — the provider confirmed your request.";
  }
  if (status === "completed") {
    return "Completed — the provider marked this job as done.";
  }
  if (status === "declined") {
    return "Declined — you can request another provider or service.";
  }
  if (status === "negotiating") {
    return "Negotiating — the provider sent you a message about this request.";
  }
  return "Pending — waiting for the provider to respond.";
}

function canWithdraw(status: BookingStatusDto) {
  return status === "pending" || status === "negotiating";
}

export function SeekerRequestsList({
  bookings,
  seekerName,
  guestIdentity = null,
  onWithdrawn,
}: SeekerRequestsListProps) {
  const { pushToast } = useToast();
  const [withdrawBooking, { isLoading }] = useWithdrawBookingMutation();
  const [pendingId, setPendingId] = useState<string | null>(null);

  const handleWithdraw = async (booking: BookingDto) => {
    if (!canWithdraw(booking.status)) return;
    const confirmed = window.confirm(
      `Withdraw your request for “${booking.serviceTitle}”? This cannot be undone.`,
    );
    if (!confirmed) return;

    setPendingId(booking.id);
    try {
      await withdrawBooking({
        id: booking.id,
        body: guestIdentity
          ? { phone: guestIdentity.phone, name: guestIdentity.name }
          : {},
      }).unwrap();
      onWithdrawn?.(booking.id);
      pushToast({
        tone: "success",
        title: "Request withdrawn",
        description: "Your booking request was removed.",
      });
    } catch (error) {
      pushToast({
        tone: "error",
        title: "Could not withdraw",
        description: getApiErrorMessage(
          error,
          "Something went wrong. Try again.",
        ),
      });
    } finally {
      setPendingId(null);
    }
  };

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
          <div className="min-w-0 flex-1 space-y-1">
            <Typography variant="h4">{booking.serviceTitle}</Typography>
            <Typography variant="caption" className="block text-muted">
              Submitted {formatBookingDateTime(booking.createdAt)}
            </Typography>
            <Typography variant="caption" className="block text-muted">
              Needed {formatBookingDateTime(booking.requestedAt)}
              {formatRelativeTime(booking.requestedAt)
                ? ` · ${formatRelativeTime(booking.requestedAt)}`
                : ""}
            </Typography>
            {booking.address ? (
              <Typography variant="caption" className="block text-muted">
                {booking.address}
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
          <div className="flex shrink-0 flex-col items-stretch gap-[var(--space-2)] sm:items-end">
            <BookingStatusChip status={booking.status} />
            {canWithdraw(booking.status) ? (
              <Button
                type="button"
                variant="secondary"
                className="h-9 min-h-9 rounded-[var(--radius-full)] px-4 text-[length:var(--text-sm)]"
                disabled={isLoading && pendingId === booking.id}
                onClick={() => void handleWithdraw(booking)}
              >
                {isLoading && pendingId === booking.id
                  ? "Withdrawing…"
                  : "Withdraw"}
              </Button>
            ) : null}
          </div>
        </li>
      ))}
    </ul>
  );
}
