"use client";

import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { useToast } from "@/components/ui";
import {
  joinSeekerRoom,
  leaveSeekerRoom,
  onBidCreated,
  onBidsUpdated,
  onBookingContactUnlocked,
  upsertBidSorted,
} from "@/lib/realtime/bidding-socket";
import { biddingApi, bookingsApi, jobsApi } from "@/service/api";
import { getAccessToken } from "@/service/splitApiSetting";
import type { AppDispatch } from "@/service/store";

function bumpJobBidCount(
  dispatch: AppDispatch,
  jobId: string,
  nextCount: number | ((prev: number) => number),
) {
  dispatch(
    jobsApi.util.updateQueryData("getMyJobs", undefined, (draft) => {
      const job = draft.find((item) => item.id === jobId);
      if (!job) return;
      const prev = job.bidCount ?? 0;
      job.bidCount =
        typeof nextCount === "function" ? nextCount(prev) : nextCount;
    }),
  );

  dispatch(
    jobsApi.util.updateQueryData("getJob", jobId, (draft) => {
      if (!draft) return;
      const prev = draft.bidCount ?? 0;
      draft.bidCount =
        typeof nextCount === "function" ? nextCount(prev) : nextCount;
    }),
  );
}

/**
 * Keeps the logged-in seeker subscribed to live job bids and booking
 * contact unlocks (provider token spend).
 */
export function SeekerRealtimeSync({ enabled }: { enabled: boolean }) {
  const dispatch = useDispatch<AppDispatch>();
  const { pushToast } = useToast();

  useEffect(() => {
    if (!enabled) return;
    const token = getAccessToken();
    if (!token) return;

    let active = true;
    const seenBidIds = new Set<string>();
    void joinSeekerRoom(token);

    const unsubCreated = onBidCreated((bid) => {
      if (!active) return;
      // Guard against duplicate socket delivery (job room + seeker room).
      if (seenBidIds.has(bid.id)) return;
      seenBidIds.add(bid.id);

      dispatch(
        biddingApi.util.updateQueryData(
          "getJobBiddings",
          bid.jobId,
          (draft) => {
            if (!Array.isArray(draft)) return;
            const next = upsertBidSorted(draft, bid);
            draft.splice(0, draft.length, ...next);
          },
        ),
      );

      bumpJobBidCount(dispatch, bid.jobId, (prev) => {
        // If the list cache already includes this bid, don't double-count.
        return prev + 1;
      });

      pushToast({
        tone: "success",
        title: "New bid",
        description: `${bid.providerName} offered $${bid.price.toFixed(0)}.`,
      });
    });

    const unsubUpdated = onBidsUpdated((bids) => {
      if (!active || bids.length === 0) return;
      const jobId = bids[0]?.jobId;
      if (!jobId) return;

      dispatch(
        biddingApi.util.updateQueryData("getJobBiddings", jobId, (draft) => {
          if (!Array.isArray(draft)) return;
          draft.splice(0, draft.length, ...bids);
        }),
      );

      bumpJobBidCount(dispatch, jobId, bids.length);
    });

    const unsubContact = onBookingContactUnlocked((payload) => {
      if (!active) return;

      const patchContact = (draft: {
        id: string;
        contactUnlocked: boolean;
        providerPhone: string | null;
        seekerPhone: string | null;
      }) => {
        if (draft.id !== payload.bookingId) return;
        draft.contactUnlocked = true;
        draft.providerPhone = payload.providerPhone;
        draft.seekerPhone = payload.seekerPhone;
      };

      dispatch(
        bookingsApi.util.updateQueryData(
          "getMyBookings",
          undefined,
          (draft) => {
            const row = draft.find((item) => item.id === payload.bookingId);
            if (row) patchContact(row);
          },
        ),
      );
      dispatch(
        bookingsApi.util.updateQueryData(
          "getBooking",
          payload.bookingId,
          (draft) => {
            if (draft) patchContact(draft);
          },
        ),
      );

      pushToast({
        tone: "success",
        title: "Contact unlocked",
        description: "The provider revealed contact details for this request.",
      });
    });

    return () => {
      active = false;
      unsubCreated();
      unsubUpdated();
      unsubContact();
      leaveSeekerRoom(token);
    };
  }, [dispatch, enabled, pushToast]);

  return null;
}
