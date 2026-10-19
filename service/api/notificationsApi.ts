import { NOTIFICATION_ENDPOINTS } from "../endpoint";
import { splitApi } from "../splitApiSetting";
import type { NotificationDto } from "./types";

export const notificationsApi = splitApi.injectEndpoints({
  endpoints: (builder) => ({
    getMyNotifications: builder.query<NotificationDto[], void>({
      query: () => NOTIFICATION_ENDPOINTS.mine,
      providesTags: [{ type: "Notification", id: "LIST" }],
    }),
    markNotificationRead: builder.mutation<NotificationDto, string>({
      query: (id) => ({
        url: NOTIFICATION_ENDPOINTS.read(id),
        method: "PATCH",
      }),
      invalidatesTags: [{ type: "Notification", id: "LIST" }],
    }),
    markAllNotificationsRead: builder.mutation<{ updated: number }, void>({
      query: () => ({
        url: NOTIFICATION_ENDPOINTS.readAll,
        method: "PATCH",
      }),
      invalidatesTags: [{ type: "Notification", id: "LIST" }],
    }),
  }),
});

export const {
  useGetMyNotificationsQuery,
  useMarkAllNotificationsReadMutation,
  useMarkNotificationReadMutation,
} = notificationsApi;
