"use client";

import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { useToast } from "@/components/ui";
import {
  joinProviderRoom,
  leaveProviderRoom,
  onBidAccepted,
} from "@/lib/realtime/bidding-socket";
import { bookingsApi, notificationsApi } from "@/service/api";
import { getAccessToken, splitApi } from "@/service/splitApiSetting";
import type { AppDispatch } from "@/service/store";

/**
 * Keeps the logged-in provider subscribed to bid-accepted events so
 * notifications + Bookings → Booked update instantly (no refresh).
 */
export function ProviderRealtimeSync({
  enabled,
}: {
  enabled: boolean;
}) {
  const dispatch = useDispatch<AppDispatch>();
  const { pushToast } = useToast();

  useEffect(() => {
    if (!enabled) return;
    const token = getAccessToken();
    if (!token) return;

    let active = true;
    void joinProviderRoom(token);

    const unsubscribe = onBidAccepted((payload) => {
      if (!active) return;

      dispatch(
        bookingsApi.util.updateQueryData(
          "getProviderBookings",
          undefined,
          (draft) => {
            const exists = draft.some((item) => item.id === payload.booking.id);
            if (!exists) {
              draft.unshift(payload.booking);
            }
          },
        ),
      );

      dispatch(
        notificationsApi.util.updateQueryData(
          "getMyNotifications",
          undefined,
          (draft) => {
            const exists = draft.some(
              (item) => item.id === payload.notification.id,
            );
            if (!exists) {
              draft.unshift(payload.notification);
            }
          },
        ),
      );

      dispatch(
        splitApi.util.invalidateTags([
          { type: "Booking", id: "PROVIDER" },
          { type: "Notification", id: "LIST" },
          { type: "Bidding", id: `MINE-${payload.bid.jobId}` },
          { type: "Job", id: "LIST" },
        ]),
      );

      pushToast({
        tone: "success",
        title: "Bid accepted",
        description: payload.notification.body,
      });
    });

    return () => {
      active = false;
      unsubscribe();
      leaveProviderRoom(token);
    };
  }, [dispatch, enabled, pushToast]);

  return null;
}
