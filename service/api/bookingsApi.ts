import { BOOKING_ENDPOINTS } from "../endpoint";
import { splitApi } from "../splitApiSetting";
import type {
  BookingDto,
  CreateBookingRequest,
  UpdateBookingStatusRequest,
  WithdrawBookingResponse,
} from "./types";

export const bookingsApi = splitApi.injectEndpoints({
  endpoints: (builder) => ({
    createBooking: builder.mutation<BookingDto, CreateBookingRequest>({
      query: (body) => ({
        url: BOOKING_ENDPOINTS.root,
        method: "POST",
        body,
      }),
      invalidatesTags: [
        { type: "Booking", id: "MINE" },
        { type: "Booking", id: "PROVIDER" },
      ],
    }),
    getMyBookings: builder.query<BookingDto[], void>({
      query: () => BOOKING_ENDPOINTS.mine,
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: "Booking" as const, id })),
              { type: "Booking", id: "MINE" },
            ]
          : [{ type: "Booking", id: "MINE" }],
    }),
    getProviderBookings: builder.query<BookingDto[], void>({
      query: () => BOOKING_ENDPOINTS.providerMine,
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: "Booking" as const, id })),
              { type: "Booking", id: "PROVIDER" },
            ]
          : [{ type: "Booking", id: "PROVIDER" }],
    }),
    markProviderBookingsSeen: builder.mutation<
      { updated: number },
      { bookingIds?: string[] } | void
    >({
      query: (body) => ({
        url: BOOKING_ENDPOINTS.providerMarkSeen,
        method: "POST",
        body: body ?? {},
      }),
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        const ids = arg && "bookingIds" in arg ? arg.bookingIds : undefined;
        const patch = dispatch(
          bookingsApi.util.updateQueryData(
            "getProviderBookings",
            undefined,
            (draft) => {
              const now = new Date().toISOString();
              for (const booking of draft) {
                if (
                  booking.status !== "pending" &&
                  booking.status !== "negotiating" &&
                  booking.status !== "accepted"
                ) {
                  continue;
                }
                if (booking.providerViewedAt) continue;
                if (ids?.length && !ids.includes(booking.id)) continue;
                booking.providerViewedAt = now;
              }
            },
          ),
        );
        try {
          await queryFulfilled;
          dispatch(
            splitApi.util.invalidateTags([
              { type: "Notification", id: "LIST" },
            ]),
          );
        } catch {
          patch.undo();
        }
      },
    }),
    getBooking: builder.query<BookingDto, string>({
      query: (id) => BOOKING_ENDPOINTS.byId(id),
      providesTags: (_result, _error, id) => [{ type: "Booking", id }],
      async onQueryStarted(_id, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          if (data.providerViewedAt) {
            dispatch(
              splitApi.util.invalidateTags([
                { type: "Booking", id: "PROVIDER" },
                { type: "Notification", id: "LIST" },
              ]),
            );
          }
        } catch {
          /* ignore */
        }
      },
    }),
    updateBookingStatus: builder.mutation<
      BookingDto,
      { id: string; body: UpdateBookingStatusRequest }
    >({
      query: ({ id, body }) => ({
        url: BOOKING_ENDPOINTS.status(id),
        method: "PATCH",
        body,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: "Booking", id },
        { type: "Booking", id: "MINE" },
        { type: "Booking", id: "PROVIDER" },
      ],
    }),
    withdrawBooking: builder.mutation<WithdrawBookingResponse, string>({
      query: (id) => ({
        url: BOOKING_ENDPOINTS.withdraw(id),
        method: "POST",
        body: {},
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: "Booking", id },
        { type: "Booking", id: "MINE" },
        { type: "Booking", id: "PROVIDER" },
      ],
    }),
  }),
});

export const {
  useCreateBookingMutation,
  useGetMyBookingsQuery,
  useGetProviderBookingsQuery,
  useMarkProviderBookingsSeenMutation,
  useGetBookingQuery,
  useUpdateBookingStatusMutation,
  useWithdrawBookingMutation,
} = bookingsApi;
