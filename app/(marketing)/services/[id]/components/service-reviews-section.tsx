"use client";

import { Typography } from "@/components/ui";
import { RatingSummary, StarRating } from "@/components/ui/star-rating";
import { formatBookingDateTime } from "@/lib/prototype-bookings";
import type { PrototypeReview } from "@/lib/prototype-types";
import type { RatingAggregate } from "@/lib/prototype-reviews";

type ServiceReviewsSectionProps = {
  rating: RatingAggregate;
  reviews: PrototypeReview[];
};

export function ServiceReviewsSection({
  rating,
  reviews,
}: ServiceReviewsSectionProps) {
  return (
    <section className="space-y-[var(--space-4)] rounded-[var(--radius-xl)] border border-border bg-surface p-[var(--space-5)]">
      <div className="flex flex-col gap-[var(--space-2)] sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Typography variant="h3" className="mb-1">
            Reviews
          </Typography>
          <Typography variant="caption" className="text-muted">
            What seekers say about this service
          </Typography>
        </div>
        <RatingSummary
          average={rating.average}
          count={rating.count}
          size="md"
          emptyLabel="No ratings yet"
        />
      </div>

      {reviews.length === 0 ? (
        <Typography variant="body" className="text-muted">
          No reviews yet for this service.
        </Typography>
      ) : (
        <ul className="divide-y divide-border border-t border-border">
          {reviews.map((review) => (
            <li
              key={review.id}
              className="space-y-[var(--space-2)] py-[var(--space-4)]"
            >
              <div className="flex flex-wrap items-center gap-[var(--space-3)]">
                <Typography variant="label">{review.seekerName}</Typography>
                <StarRating value={review.rating} />
                <Typography variant="caption" className="text-muted">
                  {formatBookingDateTime(review.createdAt)}
                </Typography>
              </div>
              {review.body ? (
                <Typography variant="body" className="text-muted">
                  “{review.body}”
                </Typography>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
