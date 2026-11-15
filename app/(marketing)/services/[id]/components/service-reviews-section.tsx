"use client";

import Link from "next/link";
import { ThumbsUp } from "lucide-react";
import { Typography, useToast } from "@/components/ui";
import { RatingSummary, StarRating } from "@/components/ui/star-rating";
import { formatReviewAge } from "@/lib/prototype-bookings";
import { cx } from "@/lib/cx";
import {
  useToggleReviewHelpfulMutation,
  type ReviewDto,
  type ReviewListDto,
} from "@/service/api";
import { getApiErrorMessage, getStoredAuthUser } from "@/service/auth-session";
import { getAccessToken } from "@/service/splitApiSetting";

type ServiceReviewsSectionProps = {
  rating: Pick<ReviewListDto, "average" | "count">;
  reviews: ReviewDto[];
  loading?: boolean;
};

function initialsFromName(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return `${parts[0]![0] ?? ""}${parts[1]![0] ?? ""}`.toUpperCase();
}

function ReviewHelpfulControl({ review }: { review: ReviewDto }) {
  const { pushToast } = useToast();
  const [toggleHelpful, { isLoading }] = useToggleReviewHelpfulMutation();
  const authUser = getStoredAuthUser();
  const hasToken = Boolean(getAccessToken());
  const isSeeker = authUser?.role === "SEEKER" && hasToken;
  const isOwnReview = isSeeker && authUser?.id === review.seekerId;

  const handleToggle = async () => {
    if (!isSeeker) {
      pushToast({
        tone: "info",
        title: "Sign in as a seeker",
        description: "Log in to mark reviews as helpful.",
      });
      return;
    }
    if (isOwnReview) {
      pushToast({
        tone: "info",
        title: "That’s your review",
        description: "You can’t mark your own review as helpful.",
      });
      return;
    }
    try {
      await toggleHelpful(review.id).unwrap();
    } catch (error) {
      pushToast({
        tone: "error",
        title: "Could not update",
        description: getApiErrorMessage(error, "Please try again."),
      });
    }
  };

  if (isOwnReview) {
    return review.helpfulCount > 0 ? (
      <Typography variant="caption" className="text-muted">
        {review.helpfulCount} found this helpful
      </Typography>
    ) : null;
  }

  if (!isSeeker) {
    return (
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
        <Typography
          variant="caption"
          className="inline-flex items-center gap-1.5 text-muted"
        >
          <ThumbsUp className="h-3.5 w-3.5 opacity-70" aria-hidden />
          {review.helpfulCount > 0
            ? `${review.helpfulCount} helpful`
            : "Be the first to find this helpful"}
        </Typography>
        <span className="text-muted/50" aria-hidden>
          ·
        </span>
        <Link
          href="/seeker/login"
          className="text-[length:var(--text-xs)] font-medium text-primary hover:underline"
        >
          Sign in to vote
        </Link>
      </div>
    );
  }

  return (
    <button
      type="button"
      disabled={isLoading}
      onClick={() => void handleToggle()}
      aria-pressed={review.viewerMarkedHelpful}
      className={cx(
        "inline-flex items-center gap-1.5 rounded-[var(--radius-full)] border px-3 py-1.5 text-[length:var(--text-xs)] font-medium transition-colors",
        "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
        review.viewerMarkedHelpful
          ? "border-primary/30 bg-primary-soft text-primary"
          : "border-border bg-surface text-muted hover:border-primary/25 hover:bg-secondary hover:text-foreground",
        isLoading && "opacity-60",
      )}
    >
      <ThumbsUp
        className={cx(
          "h-3.5 w-3.5",
          review.viewerMarkedHelpful && "fill-primary/20",
        )}
        aria-hidden
      />
      {review.viewerMarkedHelpful ? "Helpful" : "Find helpful"}
      {review.helpfulCount > 0 ? (
        <span className="tabular-nums text-muted">
          · {review.helpfulCount}
        </span>
      ) : null}
    </button>
  );
}

function ReviewItem({ review }: { review: ReviewDto }) {
  const age = formatReviewAge(review.createdAt);
  const initials = initialsFromName(review.seekerName);

  return (
    <li className="flex gap-[var(--space-4)] py-[var(--space-5)] first:pt-[var(--space-4)]">
      <span
        className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-[var(--radius-full)] bg-primary-soft text-[length:var(--text-sm)] font-semibold tracking-wide text-primary"
        aria-hidden
      >
        {initials}
      </span>

      <div className="min-w-0 flex-1 space-y-[var(--space-2)]">
        <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
          <Typography variant="label" className="truncate">
            {review.seekerName}
          </Typography>
          {age ? (
            <Typography
              variant="caption"
              className="shrink-0 text-muted"
              title={new Date(review.createdAt).toLocaleString()}
            >
              {age}
            </Typography>
          ) : null}
        </div>

        <StarRating value={review.rating} size="sm" />

        {review.comment ? (
          <Typography
            variant="body"
            className="max-w-prose leading-relaxed text-foreground/80"
          >
            {review.comment}
          </Typography>
        ) : null}

        <div className="pt-1">
          <ReviewHelpfulControl review={review} />
        </div>
      </div>
    </li>
  );
}

export function ServiceReviewsSection({
  rating,
  reviews,
  loading = false,
}: ServiceReviewsSectionProps) {
  return (
    <section className="overflow-hidden rounded-[var(--radius-xl)] border border-border/80 bg-surface shadow-[0_12px_40px_-28px_rgba(10,10,10,0.28)]">
      <div className="flex flex-col gap-[var(--space-3)] border-b border-border/70 bg-gradient-to-br from-secondary/70 via-surface to-surface px-[var(--space-5)] py-[var(--space-5)] sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <Typography variant="h3" className="mb-1 tracking-tight">
            Reviews for this service
          </Typography>
          <Typography variant="caption" className="text-muted">
            Only feedback left on this listing — not the provider’s other
            services
          </Typography>
        </div>
        <div className="rounded-[var(--radius-full)] border border-border/80 bg-surface/90 px-3 py-1.5 shadow-sm">
          <RatingSummary
            average={rating.average}
            count={rating.count}
            size="sm"
            emptyLabel="No service reviews yet"
          />
        </div>
      </div>

      <div className="px-[var(--space-5)]">
        {loading ? (
          <div className="space-y-[var(--space-4)] py-[var(--space-6)]">
            {[0, 1].map((key) => (
              <div key={key} className="flex gap-[var(--space-4)] animate-pulse">
                <span className="h-10 w-10 rounded-full bg-secondary" />
                <div className="flex-1 space-y-2 py-1">
                  <div className="h-3 w-1/3 rounded bg-secondary" />
                  <div className="h-3 w-1/4 rounded bg-secondary" />
                  <div className="h-3 w-4/5 rounded bg-secondary" />
                </div>
              </div>
            ))}
          </div>
        ) : reviews.length === 0 ? (
          <div className="py-[var(--space-8)] text-center">
            <Typography variant="body" className="text-muted">
              No reviews yet. Confirmed seekers can share how the job went.
            </Typography>
          </div>
        ) : (
          <ul className="divide-y divide-border/70">
            {reviews.map((review) => (
              <ReviewItem key={review.id} review={review} />
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
