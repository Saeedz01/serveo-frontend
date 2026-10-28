"use client";

import Link from "next/link";
import { ChevronRight, Route } from "lucide-react";
import { BookingStatusChip, Typography } from "@/components/ui";
import { usePrototype } from "@/components/prototype/prototype-provider";
import { computeTripDistance } from "@/lib/maps/distance";
import {
  formatBookingDateTime,
  formatRelativeTime,
} from "@/lib/prototype-bookings";
import type { BookingDto } from "@/service/api";

type BookingRequestCardProps = {
  booking: BookingDto;
};

export function BookingRequestCard({ booking }: BookingRequestCardProps) {
  const { state } = usePrototype();
  const service = state.services.find((item) => item.id === booking.serviceId);
  const isUnopened =
    booking.providerViewedAt === null &&
    (booking.status === "pending" ||
      booking.status === "negotiating" ||
      booking.status === "accepted");

  const trip =
    service && booking.address
      ? computeTripDistance(
          { lat: service.lat, lng: service.lng },
          { lat: booking.lat, lng: booking.lng },
        )
      : null;

  return (
    <li>
      <Link
        href={`/provider/bookings/${booking.id}`}
        className={`relative flex flex-col gap-[var(--space-4)] px-[var(--space-5)] py-[var(--space-5)] transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-primary lg:flex-row lg:items-center lg:justify-between ${
          isUnopened
            ? "border-l-4 border-l-primary bg-primary-soft hover:bg-primary-soft/90"
            : "hover:bg-secondary/40"
        }`}
      >
        <div className="min-w-0 space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <Typography variant="h4">{booking.serviceTitle}</Typography>
            {isUnopened ? (
              <span className="rounded-full bg-primary px-2.5 py-0.5 text-[length:var(--text-xs)] font-semibold text-primary-foreground shadow-sm">
                New
              </span>
            ) : null}
          </div>
          <Typography variant="label" className="block">
            {booking.seekerName}
          </Typography>
          <Typography variant="caption" className="block text-muted">
            {booking.contactUnlocked && booking.seekerPhone
              ? booking.seekerPhone
              : "Contact locked · 1 token to unlock"}
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
