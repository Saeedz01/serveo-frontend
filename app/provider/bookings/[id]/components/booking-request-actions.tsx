"use client";

import { MessageSquare } from "lucide-react";
import { Button } from "@/components/ui";
import type { PrototypeBooking } from "@/lib/prototype-types";

type BookingRequestActionsProps = {
  booking: PrototypeBooking;
  unreadMessages?: number;
  chatOpen?: boolean;
  onAccept: (bookingId: string) => void;
  onDecline: (bookingId: string) => void;
  onOpenChat: () => void;
};

export function BookingRequestActions({
  booking,
  unreadMessages = 0,
  chatOpen = false,
  onAccept,
  onDecline,
  onOpenChat,
}: BookingRequestActionsProps) {
  const canRespond =
    booking.status === "pending" || booking.status === "negotiating";

  return (
    <div className="flex flex-col gap-[var(--space-3)] sm:flex-row sm:flex-wrap">
      {canRespond ? (
        <Button
          type="button"
          className="min-h-11 flex-1 sm:flex-none sm:px-6"
          onClick={() => onAccept(booking.id)}
        >
          {booking.status === "negotiating"
            ? "Confirm booking"
            : "Accept & confirm"}
        </Button>
      ) : null}

      <Button
        type="button"
        variant={chatOpen ? "primary" : "secondary"}
        className="relative min-h-11 flex-1 sm:flex-none sm:px-6"
        onClick={onOpenChat}
        aria-expanded={chatOpen}
      >
        <MessageSquare className="h-4 w-4" aria-hidden />
        {chatOpen
          ? "Chat open"
          : booking.status === "negotiating" || unreadMessages > 0
            ? "Open chat"
            : "Negotiate"}
        {unreadMessages > 0 && !chatOpen ? (
          <span className="absolute -top-1.5 -right-1.5 inline-flex min-h-5 min-w-5 items-center justify-center rounded-full bg-error px-1.5 text-[length:var(--text-xs)] font-semibold text-white">
            {unreadMessages > 99 ? "99+" : unreadMessages}
          </span>
        ) : null}
      </Button>

      {canRespond ? (
        <Button
          type="button"
          variant="secondary"
          className="min-h-11 flex-1 border-error text-error hover:bg-red-50 sm:flex-none sm:px-6"
          onClick={() => onDecline(booking.id)}
        >
          Decline
        </Button>
      ) : null}
    </div>
  );
}
