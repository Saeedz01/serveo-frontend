"use client";

import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { useToast } from "@/components/ui";
import { usePrototype } from "@/components/prototype/prototype-provider";
import { addUnseenJob } from "@/lib/provider-unseen-jobs";
import {
  joinProviderRoom,
  leaveProviderRoom,
  onBidAccepted,
  onBookingCreated,
  onBookingWithdrawn,
  onJobCreated,
} from "@/lib/realtime/bidding-socket";
import { bookingsApi, jobsApi, notificationsApi } from "@/service/api";
import { getAccessToken, splitApi } from "@/service/splitApiSetting";
import type { AppDispatch } from "@/service/store";

/**
 * Keeps the logged-in provider subscribed to:
 * - booking:created / booking:withdrawn
 * - job:created (open jobs in published categories)
 * - bid:accepted (awarded bids → booked)
 */
export function ProviderRealtimeSync({
  enabled,
}: {
  enabled: boolean;
}) {
  const dispatch = useDispatch<AppDispatch>();
  const { pushToast } = useToast();
  const { currentProvider } = usePrototype();

  useEffect(() => {
    if (!enabled) return;
    const token = getAccessToken();
    if (!token) return;

    let active = true;
    void joinProviderRoom(token);

    const unsubBidAccepted = onBidAccepted((payload) => {
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

    const unsubBookingCreated = onBookingCreated((payload) => {
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
        ]),
      );

      pushToast({
        tone: "info",
        title: "New booking request",
        description: payload.notification.body,
      });
    });

    const unsubBookingWithdrawn = onBookingWithdrawn((payload) => {
      if (!active) return;

      dispatch(
        bookingsApi.util.updateQueryData(
          "getProviderBookings",
          undefined,
          (draft) => {
            const index = draft.findIndex(
              (item) => item.id === payload.bookingId,
            );
            if (index >= 0) {
              draft.splice(index, 1);
            }
          },
        ),
      );

      const href = `/provider/bookings/${payload.bookingId}`;
      dispatch(
        notificationsApi.util.updateQueryData(
          "getMyNotifications",
          undefined,
          (draft) => {
            for (let i = draft.length - 1; i >= 0; i -= 1) {
              if (draft[i]?.href === href) {
                draft.splice(i, 1);
              }
            }
          },
        ),
      );

      dispatch(
        splitApi.util.invalidateTags([
          { type: "Booking", id: "PROVIDER" },
          { type: "Booking", id: payload.bookingId },
          { type: "Notification", id: "LIST" },
        ]),
      );

      pushToast({
        tone: "info",
        title: "Request withdrawn",
        description: "The seeker withdrew this booking request.",
      });
    });

    const unsubJobCreated = onJobCreated((payload) => {
      if (!active) return;
      if (payload.job.status !== "open") return;

      dispatch(
        jobsApi.util.updateQueryData(
          "getProviderJobFeed",
          undefined,
          (draft) => {
            const exists = draft.some((item) => item.id === payload.job.id);
            if (!exists) {
              draft.unshift(payload.job);
            }
          },
        ),
      );

      if (currentProvider?.id) {
        addUnseenJob(currentProvider.id, payload.job.id);
      }

      dispatch(
        splitApi.util.invalidateTags([{ type: "Job", id: "PROVIDER_FEED" }]),
      );

      pushToast({
        tone: "info",
        title: "New open job",
        description: `${payload.job.title} · ${payload.job.categoryName}`,
      });
    });

    return () => {
      active = false;
      unsubBidAccepted();
      unsubBookingCreated();
      unsubBookingWithdrawn();
      unsubJobCreated();
      leaveProviderRoom(token);
    };
  }, [currentProvider?.id, dispatch, enabled, pushToast]);

  return null;
}
