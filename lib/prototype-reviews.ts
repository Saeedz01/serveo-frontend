import type {
  CreateReviewInput,
  PrototypeBooking,
  PrototypeReview,
  PrototypeState,
} from "./prototype-types";

export type RatingAggregate = {
  average: number;
  count: number;
};

function createId(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 9)}`;
}

export function reviewsForService(
  state: PrototypeState,
  serviceId: string,
): PrototypeReview[] {
  return (state.reviews ?? [])
    .filter((review) => review.serviceId === serviceId)
    .slice()
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function reviewsForProvider(
  state: PrototypeState,
  providerId: string,
): PrototypeReview[] {
  return (state.reviews ?? [])
    .filter((review) => review.providerId === providerId)
    .slice()
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function reviewForBooking(
  state: PrototypeState,
  bookingId: string,
): PrototypeReview | undefined {
  return (state.reviews ?? []).find((review) => review.bookingId === bookingId);
}

export function aggregateRating(
  reviews: PrototypeReview[],
): RatingAggregate {
  if (reviews.length === 0) {
    return { average: 0, count: 0 };
  }
  const total = reviews.reduce((sum, review) => sum + review.rating, 0);
  return {
    average: Math.round((total / reviews.length) * 10) / 10,
    count: reviews.length,
  };
}

export function ratingForProvider(
  state: PrototypeState,
  providerId: string,
): RatingAggregate {
  return aggregateRating(reviewsForProvider(state, providerId));
}

export function ratingForService(
  state: PrototypeState,
  serviceId: string,
): RatingAggregate {
  return aggregateRating(reviewsForService(state, serviceId));
}

export function canReviewBooking(
  state: PrototypeState,
  booking: PrototypeBooking,
): boolean {
  if (booking.status !== "accepted") return false;
  return !reviewForBooking(state, booking.id);
}

export function clampRating(rating: number): number {
  if (!Number.isFinite(rating)) return 1;
  return Math.min(5, Math.max(1, Math.round(rating)));
}

export function submitReview(
  state: PrototypeState,
  input: CreateReviewInput,
): { state: PrototypeState; review: PrototypeReview | null; error?: string } {
  const booking = (state.bookings ?? []).find(
    (item) => item.id === input.bookingId,
  );
  if (!booking) {
    return { state, review: null, error: "Booking not found." };
  }
  if (booking.status !== "accepted") {
    return {
      state,
      review: null,
      error: "You can only review after the provider confirms the booking.",
    };
  }
  if (reviewForBooking(state, booking.id)) {
    return { state, review: null, error: "You already reviewed this booking." };
  }

  const review: PrototypeReview = {
    id: createId("rev"),
    bookingId: booking.id,
    serviceId: booking.serviceId,
    providerId: booking.providerId,
    seekerId: booking.seekerId,
    seekerName: booking.seekerName,
    rating: clampRating(input.rating),
    body: input.body?.trim() ?? "",
    createdAt: new Date().toISOString(),
  };

  return {
    review,
    state: {
      ...state,
      reviews: [review, ...(state.reviews ?? [])],
    },
  };
}
