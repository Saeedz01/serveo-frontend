"use client";

import { MessageSquare } from "lucide-react";
import {
  BookingStatusChip,
  Button,
  EmptyState,
  Typography,
} from "@/components/ui";
import { useChat } from "@/components/chat/chat-provider";
import { usePrototype } from "@/components/prototype/prototype-provider";
import {
  findThreadForBooking,
  unreadCountForThread,
} from "@/lib/prototype-chat";
import { formatBookingDateTime } from "@/lib/prototype-bookings";
import type { PrototypeBooking } from "@/lib/prototype-types";

type SeekerRequestsListProps = {
  bookings: PrototypeBooking[];
  seekerName: string;
};

function statusMessage(status: PrototypeBooking["status"]) {
  if (status === "accepted") {
    return "Booked — the provider confirmed your request.";
  }
  if (status === "declined") {
    return "Declined — you can request another provider or service.";
  }
  if (status === "negotiating") {
    return "Negotiating — the provider sent you a message about this request.";
  }
  return "Pending — waiting for the provider to respond.";
}

export function SeekerRequestsList({
  bookings,
  seekerName,
}: SeekerRequestsListProps) {
  const { state } = usePrototype();
  const { actor } = useChat();

  if (bookings.length === 0) {
    return (
      <EmptyState
        title="No requests yet"
        description={`Hi ${seekerName}. When you request a service, you can track its status here — no account needed.`}
        action={
          <Button as="a" href="/services">
            Browse services
          </Button>
        }
      />
    );
  }

  return (
    <ul className="overflow-hidden rounded-[var(--radius-xl)] border border-border bg-surface divide-y divide-border">
      {bookings.map((booking) => {
        const thread = findThreadForBooking(state, booking);
        const unread =
          thread && actor
            ? unreadCountForThread(state, thread.id, actor)
            : 0;
        const showMessages =
          Boolean(thread) ||
          booking.status === "negotiating" ||
          booking.status === "accepted";

        return (
          <li
            key={booking.id}
            className="flex flex-col gap-[var(--space-3)] px-[var(--space-5)] py-[var(--space-5)] sm:flex-row sm:items-start sm:justify-between"
          >
            <div className="min-w-0 space-y-1">
              <Typography variant="h4">{booking.serviceTitle}</Typography>
              <Typography variant="caption" className="block text-muted">
                Submitted {formatBookingDateTime(booking.createdAt)}
              </Typography>
              <Typography variant="caption" className="block text-muted">
                Needed {formatBookingDateTime(booking.requestedAt)}
              </Typography>
              {booking.location?.address ? (
                <Typography variant="caption" className="block text-muted">
                  {booking.location.address}
                </Typography>
              ) : null}
              {booking.note ? (
                <Typography variant="body" className="pt-1 text-muted">
                  “{booking.note}”
                </Typography>
              ) : null}
              <Typography variant="body" className="pt-1">
                {statusMessage(booking.status)}
              </Typography>
              {showMessages && thread ? (
                <div className="pt-[var(--space-2)]">
                  <Button
                    as="a"
                    href={`/messages/${thread.id}`}
                    variant="secondary"
                    className="relative h-9 min-h-9 px-4 text-[length:var(--text-sm)]"
                  >
                    <MessageSquare className="h-3.5 w-3.5" aria-hidden />
                    View provider messages
                    {unread > 0 ? (
                      <span className="absolute -top-1.5 -right-1.5 inline-flex min-h-5 min-w-5 items-center justify-center rounded-full bg-error px-1.5 text-[length:var(--text-xs)] font-semibold text-white">
                        {unread > 99 ? "99+" : unread}
                      </span>
                    ) : null}
                  </Button>
                </div>
              ) : null}
              {showMessages && !thread ? (
                <Typography variant="caption" className="block pt-1 text-muted">
                  Messages appear here after the provider starts a negotiation.
                </Typography>
              ) : null}
            </div>
            <BookingStatusChip status={booking.status} />
          </li>
        );
      })}
    </ul>
  );
}
