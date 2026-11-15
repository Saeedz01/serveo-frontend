"use client";

import Link from "next/link";
import {
  CalendarClock,
  CheckCircle2,
  ChevronRight,
  CircleDot,
  Lock,
  MapPin,
  MessageSquare,
  Phone,
  Route,
  UserRound,
  XCircle,
} from "lucide-react";
import { Typography } from "@/components/ui";
import { usePrototype } from "@/components/prototype/prototype-provider";
import { cx } from "@/lib/cx";
import { computeTripDistance } from "@/lib/maps/distance";
import {
  formatBookingDateTime,
  formatRelativeTime,
} from "@/lib/prototype-bookings";
import type { BookingDto, BookingStatusDto } from "@/service/api";

type BookingRequestCardProps = {
  booking: BookingDto;
};

function statusLabel(status: BookingStatusDto) {
  if (status === "accepted") return "Confirmed";
  if (status === "completed") return "Completed";
  if (status === "declined") return "Declined";
  if (status === "negotiating") return "Negotiating";
  return "Pending";
}

function statusRailClass(status: BookingStatusDto) {
  if (status === "accepted" || status === "completed") return "bg-success";
  if (status === "declined") return "bg-error";
  if (status === "negotiating") return "bg-primary";
  return "bg-warning";
}

function statusBadgeClass(status: BookingStatusDto) {
  if (status === "accepted" || status === "completed") {
    return "bg-emerald-50 text-success";
  }
  if (status === "declined") return "bg-red-50 text-error";
  if (status === "negotiating") return "bg-primary-soft text-primary";
  return "bg-amber-50 text-warning";
}

function StatusIcon({ status }: { status: BookingStatusDto }) {
  if (status === "accepted" || status === "completed") {
    return <CheckCircle2 className="h-3.5 w-3.5" aria-hidden />;
  }
  if (status === "declined") {
    return <XCircle className="h-3.5 w-3.5" aria-hidden />;
  }
  if (status === "negotiating") {
    return <MessageSquare className="h-3.5 w-3.5" aria-hidden />;
  }
  return <CircleDot className="h-3.5 w-3.5" aria-hidden />;
}

export function BookingRequestCard({ booking }: BookingRequestCardProps) {
  const { state } = usePrototype();
  const service = state.services.find((item) => item.id === booking.serviceId);
  const isUnopened =
    booking.providerViewedAt === null &&
    (booking.status === "pending" ||
      booking.status === "negotiating" ||
      booking.status === "accepted");
  const relative = formatRelativeTime(booking.requestedAt);
  const seekerName = booking.seekerName?.trim() || "Seeker";
  const isConfirmed =
    booking.status === "accepted" || booking.status === "completed";

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
        className={cx(
          "group relative flex w-full flex-col overflow-hidden rounded-[var(--radius-xl)] border bg-surface text-left",
          "shadow-[0_14px_36px_-30px_rgba(10,10,10,0.45)]",
          "transition-[border-color,box-shadow,transform] duration-200 ease-out",
          "hover:-translate-y-0.5 hover:border-primary/35 hover:shadow-[0_22px_48px_-28px_rgba(92,61,145,0.35)]",
          "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
          "sm:flex-row sm:items-stretch",
          isConfirmed ? "border-emerald-200/80" : "border-border",
          isUnopened && "border-primary/30",
        )}
      >
        <span
          aria-hidden
          className={cx(
            "absolute inset-y-0 left-0 w-1 sm:w-1.5",
            isUnopened ? "bg-primary" : statusRailClass(booking.status),
          )}
        />

        <div className="flex min-w-0 flex-1 flex-col justify-center gap-[var(--space-3)] px-[var(--space-5)] py-[var(--space-5)] pl-[calc(var(--space-5)+0.35rem)] sm:pr-[var(--space-4)]">
          <div className="flex flex-wrap items-center gap-2.5">
            <Typography
              variant="h4"
              className="min-w-0 truncate tracking-tight"
            >
              {booking.serviceTitle}
            </Typography>
            <span
              className={cx(
                "inline-flex items-center gap-1.5 rounded-[var(--radius-full)] px-2.5 py-1 text-[length:var(--text-xs)] font-semibold tracking-wide",
                statusBadgeClass(booking.status),
              )}
            >
              <StatusIcon status={booking.status} />
              {statusLabel(booking.status)}
            </span>
            {isUnopened ? (
              <span className="inline-flex items-center rounded-[var(--radius-full)] bg-primary px-2.5 py-1 text-[length:var(--text-xs)] font-semibold text-primary-foreground">
                New
              </span>
            ) : null}
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-[var(--space-4)] sm:gap-y-2">
            <span className="inline-flex min-w-0 items-center gap-2 text-[length:var(--text-sm)] text-muted">
              <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-[var(--radius-md)] bg-secondary text-foreground/70">
                <UserRound className="h-3.5 w-3.5" aria-hidden />
              </span>
              <span className="truncate font-medium text-foreground/80">
                {seekerName}
              </span>
            </span>

            <span
              className="hidden h-1 w-1 rounded-full bg-border sm:inline-flex"
              aria-hidden
            />

            <span className="inline-flex min-w-0 items-center gap-2 text-[length:var(--text-sm)] text-muted">
              <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-[var(--radius-md)] bg-secondary text-foreground/70">
                <CalendarClock className="h-3.5 w-3.5" aria-hidden />
              </span>
              <span className="min-w-0">
                {relative ? (
                  <span className="font-semibold text-foreground">
                    {relative}
                  </span>
                ) : null}
                <span
                  className={cx(
                    "text-muted/80",
                    relative && "before:mx-1.5 before:content-['·']",
                  )}
                >
                  {formatBookingDateTime(booking.requestedAt)}
                </span>
              </span>
            </span>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-[var(--space-4)] sm:gap-y-2">
            {booking.address ? (
              <span className="inline-flex min-w-0 items-center gap-2 text-[length:var(--text-sm)] text-muted">
                <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-[var(--radius-md)] bg-secondary text-foreground/70">
                  <MapPin className="h-3.5 w-3.5" aria-hidden />
                </span>
                <span className="truncate text-foreground/80">
                  {booking.address}
                </span>
              </span>
            ) : null}

            {trip ? (
              <>
                {booking.address ? (
                  <span
                    className="hidden h-1 w-1 rounded-full bg-border sm:inline-flex"
                    aria-hidden
                  />
                ) : null}
                <span className="inline-flex items-center gap-2 text-[length:var(--text-sm)] font-medium text-primary">
                  <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-[var(--radius-md)] bg-primary-soft text-primary">
                    <Route className="h-3.5 w-3.5" aria-hidden />
                  </span>
                  {trip.distanceLabel} · {trip.etaLabel}
                </span>
              </>
            ) : null}
          </div>

          <Typography
            variant="caption"
            className="inline-flex items-center gap-1.5 font-medium text-muted"
          >
            {booking.contactUnlocked && booking.seekerPhone ? (
              <>
                <Phone className="h-3.5 w-3.5 text-primary" aria-hidden />
                <span className="text-foreground/80">{booking.seekerPhone}</span>
              </>
            ) : (
              <>
                <Lock className="h-3.5 w-3.5" aria-hidden />
                Contact locked · 1 token to unlock
              </>
            )}
          </Typography>
        </div>

        <div className="flex shrink-0 items-center justify-end gap-[var(--space-3)] border-t border-border/70 px-[var(--space-5)] py-[var(--space-4)] sm:border-t-0 sm:border-l sm:border-border/70 sm:px-[var(--space-5)] sm:py-[var(--space-5)]">
          <span
            className={cx(
              "inline-flex h-10 w-10 items-center justify-center rounded-[var(--radius-full)] border border-border bg-surface text-primary",
              "transition-all duration-200",
              "group-hover:border-primary/40 group-hover:bg-primary group-hover:text-primary-foreground",
              "group-hover:translate-x-0.5",
            )}
            aria-hidden
          >
            <ChevronRight className="h-4 w-4" />
          </span>
        </div>
      </Link>
    </li>
  );
}
