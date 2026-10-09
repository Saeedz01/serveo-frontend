"use client";

import Link from "next/link";
import { ChevronRight, MessageSquare, Route } from "lucide-react";
import { BookingStatusChip, Typography } from "@/components/ui";
import { usePrototype } from "@/components/prototype/prototype-provider";
import { computeTripDistance } from "@/lib/maps/distance";
import { unreadMessagesForBooking } from "@/lib/prototype-chat";
import { formatBookingDateTime } from "@/lib/prototype-bookings";
import type { PrototypeBooking } from "@/lib/prototype-types";

type BookingRequestCardProps = {
  booking: PrototypeBooking;
};

export function BookingRequestCard({ booking }: BookingRequestCardProps) {
  const { state, currentProvider } = usePrototype();
  const service = state.services.find((item) => item.id === booking.serviceId);

  const trip =
    service && booking.location
      ? computeTripDistance(
          { lat: service.lat, lng: service.lng },
          { lat: booking.location.lat, lng: booking.location.lng },
        )
      : null;

  const unread =
    currentProvider
      ? unreadMessagesForBooking(state, booking, currentProvider.id)
      : 0;

  return (
    <li>
      <Link
        href={`/provider/bookings/${booking.id}`}
        className="flex flex-col gap-[var(--space-4)] px-[var(--space-5)] py-[var(--space-5)] transition-colors hover:bg-secondary/40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-primary lg:flex-row lg:items-center lg:justify-between"
      >
        <div className="min-w-0 space-y-1">
          <Typography variant="h4">{booking.serviceTitle}</Typography>
          <Typography variant="label" className="block">
            {booking.seekerName}
          </Typography>
          <Typography variant="caption" className="block text-muted">
            Needed {formatBookingDateTime(booking.requestedAt)}
          </Typography>
          {booking.location?.address ? (
            <Typography variant="caption" className="block text-muted">
              {booking.location.address}
            </Typography>
          ) : null}
          {trip ? (
            <Typography
              variant="caption"
              className="inline-flex items-center gap-1.5 pt-1 font-semibold text-primary"
            >
              <Route className="h-3.5 w-3.5" aria-hidden />
              {trip.distanceLabel} · {trip.etaLabel} travel
            </Typography>
          ) : null}
        </div>
        <div className="flex items-center gap-[var(--space-3)]">
          {unread > 0 ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-error/10 px-2.5 py-1 text-[length:var(--text-xs)] font-semibold text-error">
              <MessageSquare className="h-3.5 w-3.5" aria-hidden />
              {unread > 99 ? "99+" : unread} new
            </span>
          ) : null}
          <BookingStatusChip status={booking.status} />
          <span className="inline-flex items-center gap-1 text-[length:var(--text-sm)] font-medium text-primary">
            Open
            <ChevronRight className="h-4 w-4" aria-hidden />
          </span>
        </div>
      </Link>
    </li>
  );
}
