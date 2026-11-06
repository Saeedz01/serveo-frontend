"use client";

import { useEffect, useId, useState } from "react";
import {
  CalendarClock,
  CheckCircle2,
  ChevronRight,
  CircleDot,
  Lock,
  MapPin,
  MessageSquare,
  Phone,
  UserRound,
  X,
  XCircle,
} from "lucide-react";
import {
  Button,
  EmptyState,
  Typography,
  useToast,
} from "@/components/ui";
import { cx } from "@/lib/cx";
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

function statusLabel(status: BookingStatusDto) {
  if (status === "accepted") return "Confirmed";
  if (status === "completed") return "Completed";
  if (status === "declined") return "Declined";
  if (status === "negotiating") return "Negotiating";
  return "Pending";
}

function statusMessage(status: BookingStatusDto) {
  if (status === "accepted") {
    return "Confirmed — the provider accepted your request.";
  }
  if (status === "completed") {
    return "Completed — the provider marked this job as done.";
  }
  if (status === "declined") {
    return "Declined — you can request another provider or service.";
  }
  if (status === "negotiating") {
    return "Negotiating — the provider messaged you about this request.";
  }
  return "Pending — waiting for the provider to respond.";
}

function canWithdraw(status: BookingStatusDto) {
  return status === "pending" || status === "negotiating";
}

function canShowProviderContact(booking: BookingDto) {
  return booking.contactUnlocked;
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

function RequestDetailDialog({
  booking,
  open,
  withdrawing,
  onClose,
  onWithdraw,
}: {
  booking: BookingDto | null;
  open: boolean;
  withdrawing: boolean;
  onClose: () => void;
  onWithdraw: (booking: BookingDto) => void;
}) {
  const titleId = useId();
  const descriptionId = useId();

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose, open]);

  if (!open || !booking) return null;

  const relative = formatRelativeTime(booking.requestedAt);
  const showContact = canShowProviderContact(booking);
  const providerName = booking.providerName?.trim() || "Provider";

  return (
    <div className="fixed inset-0 z-[80] flex items-end justify-center p-0 sm:items-center sm:p-[var(--space-4)]">
      <button
        type="button"
        className="absolute inset-0 bg-foreground/40 backdrop-blur-[2px]"
        aria-label="Close request details"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        className="relative flex max-h-[92vh] w-full max-w-lg flex-col overflow-hidden rounded-t-[var(--radius-xl)] border border-border bg-surface shadow-[0_28px_80px_-36px_rgba(10,10,10,0.55)] sm:rounded-[var(--radius-xl)]"
      >
        <div className="flex items-start justify-between gap-3 border-b border-border/80 px-[var(--space-5)] py-[var(--space-4)]">
          <div className="min-w-0">
            <Typography
              variant="caption"
              className="mb-1 block font-semibold tracking-wide text-primary uppercase"
            >
              Request details
            </Typography>
            <Typography id={titleId} variant="h3" className="truncate">
              {booking.serviceTitle}
            </Typography>
            <Typography
              id={descriptionId}
              variant="caption"
              className="mt-1 block text-muted"
            >
              {statusMessage(booking.status)}
            </Typography>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-[var(--radius-full)] border border-border text-muted transition-colors hover:bg-secondary hover:text-foreground"
            aria-label="Close"
          >
            <X className="h-4 w-4" aria-hidden />
          </button>
        </div>

        <div className="space-y-[var(--space-5)] overflow-y-auto px-[var(--space-5)] py-[var(--space-5)]">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={cx(
                "inline-flex items-center gap-1.5 rounded-[var(--radius-full)] px-2.5 py-1 text-[length:var(--text-xs)] font-semibold",
                statusBadgeClass(booking.status),
              )}
            >
              <StatusIcon status={booking.status} />
              {statusLabel(booking.status)}
            </span>
          </div>

          <section className="rounded-[var(--radius-xl)] border border-border bg-secondary/40 p-[var(--space-4)]">
            <Typography
              variant="caption"
              className="mb-[var(--space-3)] block font-semibold tracking-wide text-muted uppercase"
            >
              Provider
            </Typography>
            <div className="flex items-start gap-3">
              <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-[var(--radius-full)] bg-primary-soft text-primary">
                <UserRound className="h-5 w-5" aria-hidden />
              </span>
              <div className="min-w-0 flex-1 space-y-2">
                <Typography variant="h4">{providerName}</Typography>
                {showContact ? (
                  booking.providerPhone ? (
                    <a
                      href={`tel:${booking.providerPhone}`}
                      className="inline-flex items-center gap-2 text-[length:var(--text-sm)] font-semibold text-primary hover:underline"
                    >
                      <Phone className="h-4 w-4" aria-hidden />
                      {booking.providerPhone}
                    </a>
                  ) : (
                    <Typography
                      variant="caption"
                      className="inline-flex items-center gap-2 text-muted"
                    >
                      <Phone className="h-3.5 w-3.5" aria-hidden />
                      Contact number unavailable
                    </Typography>
                  )
                ) : (
                  <Typography
                    variant="caption"
                    className="inline-flex items-center gap-2 text-muted"
                  >
                    <Lock className="h-3.5 w-3.5" aria-hidden />
                    Contact unlocks when the provider spends 1 token on this
                    request
                  </Typography>
                )}
              </div>
            </div>
          </section>

          <section className="space-y-3">
            <div className="flex items-start gap-3">
              <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-[var(--radius-md)] bg-secondary text-foreground/70">
                <CalendarClock className="h-3.5 w-3.5" aria-hidden />
              </span>
              <div className="min-w-0">
                <Typography
                  variant="caption"
                  className="mb-1 block font-semibold tracking-wide text-muted uppercase"
                >
                  Service needed
                </Typography>
                {relative ? (
                  <Typography variant="label" className="block">
                    {relative}
                  </Typography>
                ) : null}
                <Typography variant="caption" className="block text-muted/80">
                  {formatBookingDateTime(booking.requestedAt)}
                </Typography>
              </div>
            </div>

            {booking.address ? (
              <div className="flex items-start gap-3">
                <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-[var(--radius-md)] bg-secondary text-foreground/70">
                  <MapPin className="h-3.5 w-3.5" aria-hidden />
                </span>
                <div className="min-w-0">
                  <Typography
                    variant="caption"
                    className="mb-1 block font-semibold tracking-wide text-muted uppercase"
                  >
                    Service location
                  </Typography>
                  <Typography variant="body" className="text-foreground/85">
                    {booking.address}
                  </Typography>
                </div>
              </div>
            ) : null}

            {booking.note ? (
              <div className="rounded-[var(--radius-lg)] border border-border/80 bg-surface px-[var(--space-4)] py-[var(--space-3)]">
                <Typography
                  variant="caption"
                  className="mb-1 block font-semibold text-muted uppercase"
                >
                  Your note
                </Typography>
                <Typography variant="body" className="text-foreground/85">
                  “{booking.note}”
                </Typography>
              </div>
            ) : null}

            <Typography variant="caption" className="block text-muted">
              Submitted {formatBookingDateTime(booking.createdAt)}
            </Typography>
          </section>
        </div>

        <div className="flex flex-col-reverse gap-2 border-t border-border/80 px-[var(--space-5)] py-[var(--space-4)] sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="secondary"
            className="w-full sm:w-auto"
            onClick={onClose}
          >
            Close
          </Button>
          {canWithdraw(booking.status) ? (
            <Button
              type="button"
              variant="secondary"
              className="w-full border-error/30 text-error hover:bg-red-50 sm:w-auto"
              disabled={withdrawing}
              onClick={() => onWithdraw(booking)}
            >
              {withdrawing ? "Withdrawing…" : "Withdraw request"}
            </Button>
          ) : null}
          {showContact && booking.providerPhone ? (
            <Button as="a" href={`tel:${booking.providerPhone}`} className="w-full sm:w-auto">
              <Phone className="h-4 w-4" aria-hidden />
              Call provider
            </Button>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export function SeekerRequestsList({
  bookings,
  seekerName,
}: SeekerRequestsListProps) {
  const { pushToast } = useToast();
  const [withdrawBooking, { isLoading }] = useWithdrawBookingMutation();
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const selected =
    bookings.find((booking) => booking.id === selectedId) ?? null;

  const handleWithdraw = async (booking: BookingDto) => {
    if (!canWithdraw(booking.status)) return;
    const confirmed = window.confirm(
      `Withdraw your request for “${booking.serviceTitle}”? This cannot be undone.`,
    );
    if (!confirmed) return;

    setPendingId(booking.id);
    try {
      await withdrawBooking(booking.id).unwrap();
      setSelectedId(null);
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
    <>
      <ul className="space-y-[var(--space-3)]">
        {bookings.map((booking) => {
          const relative = formatRelativeTime(booking.requestedAt);
          const providerName = booking.providerName?.trim() || "Provider";
          const isConfirmed = booking.status === "accepted";

          return (
            <li key={booking.id}>
              <button
                type="button"
                onClick={() => setSelectedId(booking.id)}
                className={cx(
                  "group relative flex w-full flex-col overflow-hidden rounded-[var(--radius-xl)] border bg-surface text-left",
                  "shadow-[0_14px_36px_-30px_rgba(10,10,10,0.45)]",
                  "transition-[border-color,box-shadow,transform] duration-200 ease-out",
                  "hover:-translate-y-0.5 hover:border-primary/35 hover:shadow-[0_22px_48px_-28px_rgba(92,61,145,0.35)]",
                  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
                  "sm:flex-row sm:items-stretch",
                  isConfirmed ? "border-emerald-200/80" : "border-border",
                )}
              >
                <span
                  aria-hidden
                  className={cx(
                    "absolute inset-y-0 left-0 w-1 sm:w-1.5",
                    statusRailClass(booking.status),
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
                  </div>

                  <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-[var(--space-4)] sm:gap-y-2">
                    <span className="inline-flex min-w-0 items-center gap-2 text-[length:var(--text-sm)] text-muted">
                      <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-[var(--radius-md)] bg-secondary text-foreground/70">
                        <UserRound className="h-3.5 w-3.5" aria-hidden />
                      </span>
                      <span className="truncate font-medium text-foreground/80">
                        {providerName}
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
              </button>
            </li>
          );
        })}
      </ul>

      <RequestDetailDialog
        booking={selected}
        open={Boolean(selected)}
        withdrawing={Boolean(pendingId && pendingId === selected?.id && isLoading)}
        onClose={() => setSelectedId(null)}
        onWithdraw={(booking) => void handleWithdraw(booking)}
      />
    </>
  );
}
