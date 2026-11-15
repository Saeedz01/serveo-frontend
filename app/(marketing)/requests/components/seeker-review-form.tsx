"use client";

import { useState } from "react";
import { Button, Label, Textarea, Typography } from "@/components/ui";
import { StarRating } from "@/components/ui/star-rating";
import {
  useCreateReviewMutation,
  type BookingDto,
} from "@/service/api";
import { getApiErrorMessage } from "@/service/auth-session";

type SeekerReviewFormProps = {
  booking: BookingDto;
  onSubmitted?: () => void;
};

export function SeekerReviewForm({
  booking,
  onSubmitted,
}: SeekerReviewFormProps) {
  const [createReview, { isLoading: busy }] = useCreateReviewMutation();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (rating < 1 || rating > 5) {
      setError("Tap a star rating before submitting.");
      return;
    }
    const trimmed = comment.trim();
    if (!trimmed) {
      setError("Enter a short comment for your review.");
      return;
    }

    try {
      await createReview({
        bookingId: booking.id,
        rating,
        comment: trimmed,
      }).unwrap();
      setError(null);
      onSubmitted?.();
    } catch (err) {
      setError(getApiErrorMessage(err, "Could not submit review. Try again."));
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-[var(--space-3)] space-y-[var(--space-3)] rounded-[var(--radius-lg)] border border-border bg-secondary/40 p-[var(--space-4)]"
      noValidate
    >
      <div>
        <Typography variant="label" className="mb-2 block">
          Rate this provider
        </Typography>
        <Typography variant="caption" className="mb-3 block text-muted">
          Your booking for {booking.serviceTitle} was confirmed. How did it go?
        </Typography>
        <StarRating
          value={rating}
          size="md"
          onChange={(next) => {
            setRating(next);
            setError(null);
          }}
          label="Provider rating"
        />
        {rating === 0 ? (
          <Typography variant="caption" className="mt-2 block text-muted">
            Select 1 to 5 stars
          </Typography>
        ) : null}
      </div>

      <div>
        <Label htmlFor={`review-body-${booking.id}`}>Comment</Label>
        <Textarea
          id={`review-body-${booking.id}`}
          value={comment}
          onChange={(event) => setComment(event.target.value)}
          placeholder="Share what went well or what could improve."
          rows={3}
          required
        />
      </div>

      {error ? (
        <Typography variant="caption" className="block text-error">
          {error}
        </Typography>
      ) : null}

      <Button
        type="submit"
        className="h-9 min-h-9 px-4"
        disabled={busy || rating < 1}
      >
        {busy ? "Submitting..." : "Submit review"}
      </Button>
    </form>
  );
}
