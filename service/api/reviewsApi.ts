import { REVIEW_ENDPOINTS } from "../endpoint";
import { splitApi } from "../splitApiSetting";
import type {
  BookingReviewResponse,
  CreateReviewRequest,
  ReviewDto,
  ReviewListDto,
} from "./types";

export const reviewsApi = splitApi.injectEndpoints({
  endpoints: (builder) => ({
    createReview: builder.mutation<ReviewDto, CreateReviewRequest>({
      query: (body) => ({
        url: REVIEW_ENDPOINTS.root,
        method: "POST",
        body,
      }),
      invalidatesTags: (result, _error, arg) => [
        { type: "Review", id: "MINE" },
        { type: "Review", id: `BOOKING-${arg.bookingId}` },
        { type: "Review", id: "LIST" },
        ...(result
          ? [
              { type: "Review" as const, id: `PROVIDER-${result.providerId}` },
              { type: "Review" as const, id: `SERVICE-${result.serviceId}` },
            ]
          : []),
      ],
    }),
    getMyReviews: builder.query<ReviewDto[], void>({
      query: () => REVIEW_ENDPOINTS.mine,
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: "Review" as const, id })),
              { type: "Review", id: "MINE" },
            ]
          : [{ type: "Review", id: "MINE" }],
    }),
    getProviderReviews: builder.query<ReviewListDto, string>({
      query: (providerId) => REVIEW_ENDPOINTS.provider(providerId),
      providesTags: (_result, _error, providerId) => [
        { type: "Review", id: `PROVIDER-${providerId}` },
        { type: "Review", id: "LIST" },
      ],
    }),
    getServiceReviews: builder.query<ReviewListDto, string>({
      query: (serviceId) => REVIEW_ENDPOINTS.service(serviceId),
      providesTags: (_result, _error, serviceId) => [
        { type: "Review", id: `SERVICE-${serviceId}` },
        { type: "Review", id: "LIST" },
      ],
    }),
    getBookingReview: builder.query<BookingReviewResponse, string>({
      query: (bookingId) => REVIEW_ENDPOINTS.booking(bookingId),
      providesTags: (_result, _error, bookingId) => [
        { type: "Review", id: `BOOKING-${bookingId}` },
      ],
    }),
    toggleReviewHelpful: builder.mutation<ReviewDto, string>({
      query: (reviewId) => ({
        url: REVIEW_ENDPOINTS.helpful(reviewId),
        method: "POST",
      }),
      async onQueryStarted(reviewId, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(
            reviewsApi.util.updateQueryData(
              "getServiceReviews",
              data.serviceId,
              (draft) => {
                const row = draft.reviews.find((item) => item.id === reviewId);
                if (!row) return;
                row.helpfulCount = data.helpfulCount;
                row.viewerMarkedHelpful = data.viewerMarkedHelpful;
              },
            ),
          );
          dispatch(
            reviewsApi.util.updateQueryData(
              "getProviderReviews",
              data.providerId,
              (draft) => {
                const row = draft.reviews.find((item) => item.id === reviewId);
                if (!row) return;
                row.helpfulCount = data.helpfulCount;
                row.viewerMarkedHelpful = data.viewerMarkedHelpful;
              },
            ),
          );
        } catch {
          // Keep list state; caller surfaces the error toast/message.
        }
      },
      invalidatesTags: [{ type: "Review", id: "LIST" }],
    }),
  }),
});

export const {
  useCreateReviewMutation,
  useGetMyReviewsQuery,
  useGetProviderReviewsQuery,
  useGetServiceReviewsQuery,
  useGetBookingReviewQuery,
  useToggleReviewHelpfulMutation,
} = reviewsApi;
