import { BOOKING_ENDPOINTS } from "../endpoint";
import { splitApi } from "../splitApiSetting";
import type {
  BookingDto,
  CreateBookingRequest,
  GuestLookupRequest,
  UpdateBookingStatusRequest,
  WithdrawBookingRequest,
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
    guestLookupBookings: builder.mutation<BookingDto[], GuestLookupRequest>({
      query: (body) => ({
        url: BOOKING_ENDPOINTS.guestLookup,
        method: "POST",
        body,
      }),
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
    getBooking: builder.query<BookingDto, string>({
      query: (id) => BOOKING_ENDPOINTS.byId(id),
      providesTags: (_result, _error, id) => [{ type: "Booking", id }],
      // Opening a booking marks it viewed + related notifications read on the server.
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
    withdrawBooking: builder.mutation<
      WithdrawBookingResponse,
      { id: string; body?: WithdrawBookingRequest }
    >({
      query: ({ id, body }) => ({
        url: BOOKING_ENDPOINTS.withdraw(id),
        method: "POST",
        body: body ?? {},
      }),
      invalidatesTags: (_result, _error, { id }) => [
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
  useGuestLookupBookingsMutation,
  useGetProviderBookingsQuery,
  useGetBookingQuery,
  useUpdateBookingStatusMutation,
  useWithdrawBookingMutation,
} = bookingsApi;
