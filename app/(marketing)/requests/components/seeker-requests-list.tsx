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
      await withdrawBooking(booking.id).unwrap();
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
          <Button as="a" href="/">
            Browse services
          </Button>
        }
      />
    );
  }

  return (
    <ul className="space-y-[var(--space-3)]">
      {bookings.map((booking) => (
        <li
          key={booking.id}
          className="rounded-[var(--radius-xl)] border border-border bg-surface p-[var(--space-5)] shadow-[0_12px_32px_-28px_rgba(10,10,10,0.35)]"
        >
          <div className="flex flex-col gap-[var(--space-4)] sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0 flex-1 space-y-[var(--space-2)]">
              <div className="flex flex-wrap items-center gap-2">
                <Typography variant="h4">{booking.serviceTitle}</Typography>
                <BookingStatusChip status={booking.status} />
              </div>
              <Typography variant="body" className="text-muted">
                {statusMessage(booking.status)}
              </Typography>
              <div className="flex flex-wrap gap-x-[var(--space-4)] gap-y-1">
                <Typography variant="caption" className="text-muted">
                  Needed {formatBookingDateTime(booking.requestedAt)}
                  {formatRelativeTime(booking.requestedAt)
                    ? ` · ${formatRelativeTime(booking.requestedAt)}`
                    : ""}
                </Typography>
                <Typography variant="caption" className="text-muted">
                  Submitted {formatBookingDateTime(booking.createdAt)}
                </Typography>
              </div>
              {booking.address ? (
                <Typography variant="caption" className="block text-muted">
                  {booking.address}
                </Typography>
              ) : null}
              {booking.note ? (
                <Typography
                  variant="body"
                  className="rounded-[var(--radius-lg)] bg-secondary/60 px-[var(--space-3)] py-[var(--space-2)] text-muted"
                >
                  “{booking.note}”
                </Typography>
              ) : null}
            </div>
            {canWithdraw(booking.status) ? (
              <Button
                type="button"
                variant="secondary"
                className="h-9 min-h-9 shrink-0 rounded-[var(--radius-full)] px-4 text-[length:var(--text-sm)]"
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
