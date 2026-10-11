"use client";

import { useState } from "react";
import { Button, Label, Textarea, Typography } from "@/components/ui";
import { StarRating } from "@/components/ui/star-rating";
import { usePrototype } from "@/components/prototype/prototype-provider";
import type { PrototypeBooking } from "@/lib/prototype-types";

type SeekerReviewFormProps = {
  booking: PrototypeBooking;
  onSubmitted?: () => void;
};

export function SeekerReviewForm({
  booking,
  onSubmitted,
}: SeekerReviewFormProps) {
  const { submitReview } = usePrototype();
  const [rating, setRating] = useState(5);
  const [body, setBody] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (rating < 1 || rating > 5) {
      setError("Choose a rating from 1 to 5 stars.");
      return;
    }
    setBusy(true);
    const result = submitReview({
      bookingId: booking.id,
      rating,
      body,
    });
    setBusy(false);
    if (!result.ok) {
      setError(result.reason);
      return;
    }
    setError(null);
    onSubmitted?.();
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
          onChange={setRating}
          label="Provider rating"
        />
      </div>

      <div>
        <Label htmlFor={`review-body-${booking.id}`}>Comment (optional)</Label>
        <Textarea
          id={`review-body-${booking.id}`}
          value={body}
          onChange={(event) => setBody(event.target.value)}
          placeholder="Share what went well or what could improve."
          rows={3}
        />
      </div>

      {error ? (
        <Typography variant="caption" className="block text-error">
          {error}
        </Typography>
      ) : null}

      <Button type="submit" className="h-9 min-h-9 px-4" disabled={busy}>
        {busy ? "Submitting..." : "Submit review"}
      </Button>
    </form>
  );
}
