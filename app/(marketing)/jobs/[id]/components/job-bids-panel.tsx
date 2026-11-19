"use client";

import { useEffect, useId, useState } from "react";
import {
  CalendarClock,
  CheckCircle2,
  ChevronRight,
  CircleDot,
  MessageSquareText,
  Phone,
  UserRound,
  X,
  XCircle,
} from "lucide-react";
import {
  Button,
  EmptyState,
  ProviderListSkeleton,
  Typography,
} from "@/components/ui";
import { RatingSummary } from "@/components/ui/star-rating";
import { cx } from "@/lib/cx";
import {
  formatBookingDateTime,
  formatRelativeTime,
} from "@/lib/prototype-bookings";
import {
  useGetProviderReviewsQuery,
  type BiddingDto,
  type JobDto,
} from "@/service/api";

type JobBidsPanelProps = {
  job: JobDto;
  bids: BiddingDto[];
  loading?: boolean;
  canAccept?: boolean;
  acceptingBidId?: string | null;
  onAcceptBid?: (bidId: string) => void;
};

function initialsFromName(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return `${parts[0]![0] ?? ""}${parts[1]![0] ?? ""}`.toUpperCase();
}

function bidStatusLabel(status: BiddingDto["status"]) {
  if (status === "accepted") return "Accepted";
  if (status === "rejected") return "Not selected";
  return "Pending";
}

function bidRailClass(status: BiddingDto["status"]) {
  if (status === "accepted") return "bg-success";
  if (status === "rejected") return "bg-muted";
  return "bg-primary";
}

function bidBadgeClass(status: BiddingDto["status"]) {
  if (status === "accepted") return "bg-emerald-50 text-success";
  if (status === "rejected") return "bg-secondary text-muted";
  return "bg-primary-soft text-primary";
}

function BidStatusIcon({ status }: { status: BiddingDto["status"] }) {
  if (status === "accepted") {
    return <CheckCircle2 className="h-3.5 w-3.5" aria-hidden />;
  }
  if (status === "rejected") {
    return <XCircle className="h-3.5 w-3.5" aria-hidden />;
  }
  return <CircleDot className="h-3.5 w-3.5" aria-hidden />;
}

function BidProviderDialog({
  bid,
  job,
  open,
  canAccept,
  accepting,
  onClose,
  onAccept,
}: {
  bid: BiddingDto | null;
  job: JobDto;
  open: boolean;
  canAccept: boolean;
  accepting: boolean;
  onClose: () => void;
  onAccept: (bidId: string) => void;
}) {
  const titleId = useId();
  const descriptionId = useId();
  const providerId = bid?.providerId ?? "";
  const { data: providerReviews, isFetching: reviewsLoading } =
    useGetProviderReviewsQuery(providerId, {
      skip: !open || !providerId,
    });

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose, open]);

  if (!open || !bid) return null;

  const providerName = bid.providerName?.trim() || "Provider";
  const relative = formatRelativeTime(bid.createdAt);
  const showAccept =
    canAccept && job.status === "open" && bid.status === "pending";
  const average = providerReviews?.average ?? 0;
  const count = providerReviews?.count ?? 0;
  const isAccepted = bid.status === "accepted";
  const acceptedPhone =
    isAccepted &&
    job.awardedProvider?.id === bid.providerId &&
    job.awardedProvider.phone
      ? job.awardedProvider.phone
      : null;

  return (
    <div className="fixed inset-0 z-[80] flex items-end justify-center p-0 sm:items-center sm:p-[var(--space-4)]">
      <button
        type="button"
        className="absolute inset-0 bg-foreground/40 backdrop-blur-[2px]"
        aria-label="Close bid details"
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
              Bid details
            </Typography>
            <Typography id={titleId} variant="h3" className="truncate">
              {providerName}
            </Typography>
            <Typography
              id={descriptionId}
              variant="caption"
              className="mt-1 block text-muted"
            >
              Offer for “{job.title}”
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
                bidBadgeClass(bid.status),
              )}
            >
              <BidStatusIcon status={bid.status} />
              {bidStatusLabel(bid.status)}
            </span>
          </div>

          <section className="space-y-[var(--space-3)] rounded-[var(--radius-xl)] border border-border bg-secondary/40 p-[var(--space-4)]">
            <Typography
              variant="caption"
              className="block font-semibold tracking-wide text-muted uppercase"
            >
              Provider
            </Typography>
            <div className="flex items-start gap-3">
              <span
                className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-[var(--radius-full)] bg-primary-soft text-[length:var(--text-sm)] font-semibold tracking-wide text-primary"
                aria-hidden
              >
                {initialsFromName(providerName)}
              </span>
              <div className="min-w-0 flex-1 space-y-1">
                <Typography variant="h4">{providerName}</Typography>
                <Typography variant="caption" className="block text-muted">
                  Overall score across all of this provider’s services
                </Typography>
              </div>
            </div>
            <div className="rounded-[var(--radius-lg)] border border-border/70 bg-surface/80 px-3 py-2.5">
              <Typography
                variant="caption"
                className="mb-1.5 block font-semibold tracking-wide text-muted uppercase"
              >
                Overall rating
              </Typography>
              {reviewsLoading && !providerReviews ? (
                <Typography variant="caption" className="text-muted">
                  Loading…
                </Typography>
              ) : (
                <RatingSummary
                  average={average}
                  count={count}
                  size="sm"
                  emptyLabel="No provider reviews yet"
                />
              )}
            </div>
            {isAccepted ? (
              <div className="rounded-[var(--radius-lg)] border border-emerald-200/80 bg-emerald-50/50 px-3 py-2.5">
                <Typography
                  variant="caption"
                  className="mb-1.5 block font-semibold tracking-wide text-success uppercase"
                >
                  Contact details
                </Typography>
                {acceptedPhone ? (
                  <a
                    href={`tel:${acceptedPhone}`}
                    className="inline-flex items-center gap-2 text-[length:var(--text-sm)] font-semibold text-primary hover:underline"
                  >
                    <Phone className="h-4 w-4" aria-hidden />
                    {acceptedPhone}
                  </a>
                ) : (
                  <Typography variant="caption" className="text-muted">
                    Phone unavailable for this provider.
                  </Typography>
                )}
              </div>
            ) : null}
          </section>

          <section className="overflow-hidden rounded-[var(--radius-xl)] border border-border/80 bg-surface">
            <div className="border-b border-border/60 bg-primary-soft/40 px-3.5 py-3">
              <Typography
                variant="caption"
                className="mb-1 block font-semibold tracking-wide text-muted uppercase"
              >
                Bid amount
              </Typography>
              <Typography variant="h2" className="tracking-tight text-primary">
                ${bid.price.toFixed(0)}
              </Typography>
            </div>
            <div className="space-y-3 px-3.5 py-3">
              <div className="flex items-start gap-2">
                <CalendarClock
                  className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary"
                  aria-hidden
                />
                <div className="min-w-0">
                  <Typography
                    variant="caption"
                    className="mb-0.5 block font-semibold tracking-wide text-muted uppercase"
                  >
                    Received
                  </Typography>
                  {relative ? (
                    <Typography variant="label" className="block">
                      {relative}
                    </Typography>
                  ) : null}
                  <Typography variant="caption" className="block text-muted">
                    {formatBookingDateTime(bid.createdAt)}
                  </Typography>
                </div>
              </div>

              {bid.note ? (
                <div className="rounded-[var(--radius-lg)] border border-border/70 bg-secondary/30 px-3 py-2.5">
                  <Typography
                    variant="caption"
                    className="mb-1 inline-flex items-center gap-1.5 font-semibold tracking-wide text-muted uppercase"
                  >
                    <MessageSquareText className="h-3.5 w-3.5" aria-hidden />
                    Provider note
                  </Typography>
                  <Typography variant="body" className="text-foreground/85">
                    “{bid.note}”
                  </Typography>
                </div>
              ) : (
                <Typography variant="caption" className="block text-muted">
                  No note included with this bid.
                </Typography>
              )}
            </div>
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
          {acceptedPhone ? (
            <Button as="a" href={`tel:${acceptedPhone}`} className="w-full sm:w-auto">
              <Phone className="h-4 w-4" aria-hidden />
              Call provider
            </Button>
          ) : null}
          {showAccept ? (
            <Button
              type="button"
              className="w-full sm:w-auto"
              disabled={accepting}
              onClick={() => onAccept(bid.id)}
            >
              {accepting ? "Accepting…" : "Accept bid"}
            </Button>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export function JobBidsPanel({
  job,
  bids,
  loading,
  canAccept = false,
  acceptingBidId = null,
  onAcceptBid,
}: JobBidsPanelProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = bids.find((bid) => bid.id === selectedId) ?? null;

  if (loading) {
    return <ProviderListSkeleton rows={3} />;
  }

  if (bids.length === 0) {
    return (
      <EmptyState
        title={job.status === "open" ? "No bids yet" : "No bids"}
        description={
          job.status === "open"
            ? "When providers bid, open a card to review their rating and offer."
            : "This job has no bids to show."
        }
      />
    );
  }

  return (
    <>
      <div className="space-y-[var(--space-4)]">
        <div>
          <Typography variant="h3" className="mb-1 tracking-tight">
            Bids ({bids.length})
          </Typography>
          <Typography variant="caption" className="text-muted">
            Tap a provider to see ratings and full bid details
          </Typography>
        </div>

        <ul className="space-y-[var(--space-3)]">
          {bids.map((bid) => {
            const relative = formatRelativeTime(bid.createdAt);
            const showAccept =
              canAccept &&
              job.status === "open" &&
              bid.status === "pending" &&
              Boolean(onAcceptBid);
            const isAccepted = bid.status === "accepted";
            const acceptedPhone =
              isAccepted &&
              job.awardedProvider?.id === bid.providerId &&
              job.awardedProvider.phone
                ? job.awardedProvider.phone
                : null;

            return (
              <li key={bid.id}>
                <div
                  className={cx(
                    "group relative flex w-full flex-col overflow-hidden rounded-[var(--radius-xl)] border bg-surface text-left",
                    "shadow-[0_14px_36px_-30px_rgba(10,10,10,0.45)]",
                    "transition-[border-color,box-shadow,transform] duration-200 ease-out",
                    "hover:-translate-y-0.5 hover:border-primary/35 hover:shadow-[0_22px_48px_-28px_rgba(92,61,145,0.35)]",
                    "sm:flex-row sm:items-stretch",
                    isAccepted ? "border-emerald-200/80" : "border-border",
                  )}
                >
                  <span
                    aria-hidden
                    className={cx(
                      "absolute inset-y-0 left-0 w-1 sm:w-1.5",
                      bidRailClass(bid.status),
                    )}
                  />

                  <button
                    type="button"
                    onClick={() => setSelectedId(bid.id)}
                    className="flex min-w-0 flex-1 flex-col justify-center gap-[var(--space-3)] px-[var(--space-5)] py-[var(--space-5)] pl-[calc(var(--space-5)+0.35rem)] text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-primary sm:pr-[var(--space-4)]"
                  >
                    <div className="flex flex-wrap items-center gap-2.5">
                      <Typography
                        variant="h4"
                        className="min-w-0 truncate tracking-tight"
                      >
                        {bid.providerName}
                      </Typography>
                      <span
                        className={cx(
                          "inline-flex items-center gap-1.5 rounded-[var(--radius-full)] px-2.5 py-1 text-[length:var(--text-xs)] font-semibold tracking-wide",
                          bidBadgeClass(bid.status),
                        )}
                      >
                        <BidStatusIcon status={bid.status} />
                        {bidStatusLabel(bid.status)}
                      </span>
                    </div>

                    <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-[var(--space-4)] sm:gap-y-2">
                      <span className="inline-flex min-w-0 items-center gap-2 text-[length:var(--text-sm)] text-muted">
                        <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-[var(--radius-md)] bg-primary-soft text-primary">
                          <UserRound className="h-3.5 w-3.5" aria-hidden />
                        </span>
                        <span className="font-[family-name:var(--font-display)] text-[length:var(--text-xl)] font-semibold tracking-tight text-primary tabular-nums">
                          ${bid.price.toFixed(0)}
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
                            {formatBookingDateTime(bid.createdAt)}
                          </span>
                        </span>
                      </span>
                    </div>

                    {bid.note ? (
                      <Typography
                        variant="caption"
                        className="line-clamp-2 text-muted"
                      >
                        “{bid.note}”
                      </Typography>
                    ) : null}

                    {acceptedPhone ? (
                      <a
                        href={`tel:${acceptedPhone}`}
                        onClick={(event) => event.stopPropagation()}
                        className="inline-flex items-center gap-2 text-[length:var(--text-sm)] font-semibold text-primary hover:underline"
                      >
                        <Phone className="h-4 w-4" aria-hidden />
                        {acceptedPhone}
                      </a>
                    ) : null}
                  </button>

                  <div className="flex shrink-0 items-center justify-end gap-[var(--space-3)] border-t border-border/70 px-[var(--space-5)] py-[var(--space-4)] sm:border-t-0 sm:border-l sm:border-border/70 sm:px-[var(--space-5)] sm:py-[var(--space-5)]">
                    {acceptedPhone ? (
                      <Button
                        as="a"
                        href={`tel:${acceptedPhone}`}
                        className="h-9 min-h-9 px-3.5"
                      >
                        <Phone className="h-4 w-4" aria-hidden />
                        Call
                      </Button>
                    ) : null}
                    {showAccept ? (
                      <Button
                        type="button"
                        className="h-9 min-h-9 px-3.5"
                        disabled={acceptingBidId === bid.id}
                        onClick={() => onAcceptBid?.(bid.id)}
                      >
                        {acceptingBidId === bid.id
                          ? "Accepting…"
                          : "Accept bid"}
                      </Button>
                    ) : null}
                    <button
                      type="button"
                      onClick={() => setSelectedId(bid.id)}
                      className={cx(
                        "inline-flex h-10 w-10 items-center justify-center rounded-[var(--radius-full)] border border-border bg-surface text-primary",
                        "transition-all duration-200",
                        "hover:border-primary/40 hover:bg-primary hover:text-primary-foreground",
                        "group-hover:translate-x-0.5",
                        "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
                      )}
                      aria-label={`View details for ${bid.providerName}`}
                    >
                      <ChevronRight className="h-4 w-4" aria-hidden />
                    </button>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </div>

      <BidProviderDialog
        bid={selected}
        job={job}
        open={Boolean(selected)}
        canAccept={canAccept}
        accepting={Boolean(
          selected && acceptingBidId === selected.id,
        )}
        onClose={() => setSelectedId(null)}
        onAccept={(bidId) => {
          onAcceptBid?.(bidId);
        }}
      />
    </>
  );
}
