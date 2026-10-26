"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  CalendarClock,
  MapPin,
  NotebookPen,
  Phone,
  UserRound,
} from "lucide-react";
import {
  BookingStatusChip,
  Button,
  ConfirmDialog,
  EmptyState,
  Typography,
  useToast,
} from "@/components/ui";
import { useChat } from "@/components/chat/chat-provider";
import { usePrototype } from "@/components/prototype/prototype-provider";
import {
  findThreadForBooking,
  unreadMessagesForBooking,
} from "@/lib/prototype-chat";
import {
  formatBookingDateTime,
  formatRelativeTime,
} from "@/lib/prototype-bookings";
import type { PrototypeBooking } from "@/lib/prototype-types";
import {
  useGetBookingQuery,
  useUnlockContactMutation,
  useUpdateBookingStatusMutation,
  type BookingDto,
} from "@/service/api";
import { getApiErrorMessage } from "@/service/auth-session";
import { getAccessToken } from "@/service/splitApiSetting";
import { BookingInlineChat } from "./booking-inline-chat";
import { BookingRequestActions } from "./booking-request-actions";
import { BookingTripPanel } from "./booking-trip-panel";

type BookingRequestDetailProps = {
  bookingId: string;
  /** When true (message notification deep-link), open chat over the travel panel. */
  openChatFromNotification?: boolean;
};

function toPrototypeBookingShape(booking: BookingDto): PrototypeBooking {
  return {
    id: booking.id,
    serviceId: booking.serviceId,
    providerId: booking.providerId,
    serviceTitle: booking.serviceTitle,
    seekerName: booking.seekerName,
    seekerPhone: booking.seekerPhone ?? "",
    seekerId: booking.seekerId ?? undefined,
    location: {
      address: booking.address,
      lat: booking.lat,
      lng: booking.lng,
    },
    requestedAt: booking.requestedAt,
    note: booking.note,
    status: booking.status,
    createdAt: booking.createdAt,
  };
}

export function BookingRequestDetail({
  bookingId,
  openChatFromNotification = false,
}: BookingRequestDetailProps) {
  const { ready, currentProvider, state } = usePrototype();
  const { transport } = useChat();
  const { pushToast } = useToast();
  const hasToken = Boolean(getAccessToken());
  const [chatOpen, setChatOpen] = useState(false);
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null);
  const [unlockConfirmOpen, setUnlockConfirmOpen] = useState(false);
  const autoOpenedRef = useRef(false);
  const [updateStatus, { isLoading: statusBusy }] =
    useUpdateBookingStatusMutation();
  const [unlockContact, { isLoading: unlockBusy }] =
    useUnlockContactMutation();

  const {
    data: booking,
    isLoading,
    isError,
  } = useGetBookingQuery(bookingId, {
    skip: !ready || !currentProvider || !hasToken || !bookingId,
  });

  const service = useMemo(
    () =>
      booking
        ? state.services.find((item) => item.id === booking.serviceId)
        : undefined,
    [booking, state.services],
  );

  const prototypeBooking = useMemo(
    () => (booking ? toPrototypeBookingShape(booking) : null),
    [booking],
  );

  const existingThread = useMemo(
    () =>
      prototypeBooking
        ? findThreadForBooking(state, prototypeBooking)
        : undefined,
    [prototypeBooking, state],
  );

  const unreadMessages = useMemo(() => {
    if (!prototypeBooking || !currentProvider) return 0;
    return unreadMessagesForBooking(
      state,
      prototypeBooking,
      currentProvider.id,
    );
  }, [currentProvider, prototypeBooking, state]);

  const threadId = activeThreadId ?? existingThread?.id ?? null;

  const openChatForRequest = (
    providerId: string,
    forBooking: NonNullable<typeof booking>,
    { negotiate = true }: { negotiate?: boolean } = {},
  ) => {
    if (!forBooking.seekerId) {
      setChatOpen(true);
      return;
    }

    if (negotiate && forBooking.status === "pending") {
      void updateStatus({
        id: forBooking.id,
        body: { status: "negotiating" },
      })
        .unwrap()
        .catch(() => {
          /* chat can still open */
        });
    }

    void transport
      .openThread({
        me: { role: "provider", id: providerId },
        peer: { role: "seeker", id: forBooking.seekerId },
        serviceId: forBooking.serviceId,
        serviceTitle: forBooking.serviceTitle,
        bookingId: forBooking.id,
      })
      .then((thread) => {
        setActiveThreadId(thread.id);
        setChatOpen(true);
      })
      .catch(() => {
        setChatOpen(false);
      });
  };

  useEffect(() => {
    if (!openChatFromNotification || autoOpenedRef.current) return;
    if (!ready || !currentProvider || !booking) return;
    if (booking.providerId !== currentProvider.id) return;
    if (!booking.contactUnlocked) return;

    autoOpenedRef.current = true;
    openChatForRequest(currentProvider.id, booking, { negotiate: false });
    // Intentionally run once when arriving from a message notification.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openChatFromNotification, ready, currentProvider, booking]);

  const handleAccept = async (id: string) => {
    try {
      await updateStatus({ id, body: { status: "accepted" } }).unwrap();
      pushToast({
        tone: "success",
        title: "Booking confirmed",
        description: "The seeker can see this request as accepted.",
      });
    } catch (error) {
      pushToast({
        tone: "error",
        title: "Could not accept",
        description: getApiErrorMessage(error, "Try again."),
      });
    }
  };

  const handleDecline = async (id: string) => {
    try {
      await updateStatus({ id, body: { status: "declined" } }).unwrap();
      pushToast({
        tone: "success",
        title: "Request declined",
        description: "This booking request was declined.",
      });
    } catch (error) {
      pushToast({
        tone: "error",
        title: "Could not decline",
        description: getApiErrorMessage(error, "Try again."),
      });
    }
  };

  const handleComplete = async (id: string) => {
    try {
      await updateStatus({ id, body: { status: "completed" } }).unwrap();
      pushToast({
        tone: "success",
        title: "Marked completed",
        description: "This booking now shows under Completed.",
      });
    } catch (error) {
      pushToast({
        tone: "error",
        title: "Could not complete",
        description: getApiErrorMessage(error, "Try again."),
      });
    }
  };

  const handleUnlockContact = async () => {
    if (!booking) return;
    try {
      const result = await unlockContact({
        targetType: "BOOKING",
        targetId: booking.id,
      }).unwrap();
      setUnlockConfirmOpen(false);
      pushToast({
        tone: "success",
        title: result.alreadyUnlocked ? "Already unlocked" : "Contact unlocked",
        description: result.alreadyUnlocked
          ? "Seeker phone and chat are available."
          : `1 token spent. ${result.balance} tokens left this month.`,
      });
    } catch (error) {
      pushToast({
        tone: "error",
        title: "Could not unlock",
        description: getApiErrorMessage(error, "Try again."),
      });
    }
  };

  if (!ready || isLoading) {
    return <Typography variant="body">Loading request...</Typography>;
  }

  if (!currentProvider) {
    return (
      <EmptyState
        title="Provider session required"
        description="Log in as a provider to open booking requests."
        action={
          <Button as="a" href="/provider/login">
            Provider login
          </Button>
        }
      />
    );
  }

  if (!hasToken || isError || !booking) {
    return (
      <EmptyState
        title="Request not found"
        description="This booking may have been removed or belongs to another provider."
        action={
          <Button as="a" href="/provider/bookings" variant="secondary">
            Back to requests
          </Button>
        }
      />
    );
  }

  const origin = {
    lat: service?.lat ?? booking.lat,
    lng: service?.lng ?? booking.lng,
    label: service?.address ?? "Your service base",
  };

  const destination = {
    lat: booking.lat,
    lng: booking.lng,
    label: booking.address,
  };

  return (
    <div className="space-y-[var(--space-6)]">
      <div>
        <Link
          href="/provider/bookings"
          className="mb-[var(--space-4)] inline-flex items-center gap-2 text-[length:var(--text-sm)] font-medium text-primary hover:underline"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />
          All requests
        </Link>

        <div className="flex flex-col gap-[var(--space-3)] sm:flex-row sm:items-start sm:justify-between">
          <div>
            <Typography
              variant="caption"
              className="mb-2 block font-semibold tracking-wide text-primary uppercase"
            >
              Booking request
            </Typography>
            <Typography variant="h1" className="mb-[var(--space-2)]">
              {booking.serviceTitle}
            </Typography>
            <Typography variant="body" className="text-muted">
              Review every detail and travel distance before you respond.
            </Typography>
          </div>
          <BookingStatusChip status={booking.status} />
        </div>
      </div>

      <div className="grid gap-[var(--space-5)] lg:grid-cols-[1.05fr_0.95fr] lg:items-start">
        <section className="space-y-[var(--space-4)] rounded-[var(--radius-xl)] border border-border bg-surface p-[var(--space-5)]">
          <Typography variant="h3">Request details</Typography>

          <dl className="space-y-[var(--space-4)]">
            <div className="flex gap-[var(--space-3)]">
              <UserRound
                className="mt-0.5 h-4 w-4 shrink-0 text-primary"
                aria-hidden
              />
              <div>
                <Typography variant="caption" className="mb-1 block text-muted">
                  Seeker
                </Typography>
                <Typography variant="label" className="block">
                  {booking.seekerName}
                </Typography>
              </div>
            </div>

            <div className="flex gap-[var(--space-3)]">
              <Phone
                className="mt-0.5 h-4 w-4 shrink-0 text-primary"
                aria-hidden
              />
              <div>
                <Typography variant="caption" className="mb-1 block text-muted">
                  Phone
                </Typography>
                {booking.contactUnlocked && booking.seekerPhone ? (
                  <Typography variant="body">{booking.seekerPhone}</Typography>
                ) : (
                  <Typography variant="body" className="text-muted">
                    Locked · spend 1 token to unlock
                  </Typography>
                )}
              </div>
            </div>

            <div className="flex gap-[var(--space-3)]">
              <CalendarClock
                className="mt-0.5 h-4 w-4 shrink-0 text-primary"
                aria-hidden
              />
              <div>
                <Typography variant="caption" className="mb-1 block text-muted">
                  Needed at
                </Typography>
                <Typography variant="body">
                  {formatBookingDateTime(booking.requestedAt)}
                </Typography>
                {formatRelativeTime(booking.requestedAt) ? (
                  <span className="mt-2 inline-flex items-center rounded-[var(--radius-full)] bg-primary px-3 py-1 text-[length:var(--text-sm)] font-semibold text-primary-foreground">
                    {formatRelativeTime(booking.requestedAt)}
                  </span>
                ) : null}
                <Typography variant="caption" className="mt-2 block text-muted">
                  Requested {formatBookingDateTime(booking.createdAt)}
                </Typography>
              </div>
            </div>

            <div className="flex gap-[var(--space-3)]">
              <MapPin
                className="mt-0.5 h-4 w-4 shrink-0 text-primary"
                aria-hidden
              />
              <div>
                <Typography variant="caption" className="mb-1 block text-muted">
                  Job location
                </Typography>
                <Typography variant="body">{booking.address}</Typography>
                <Typography variant="caption" className="mt-1 block text-muted">
                  {booking.lat.toFixed(5)}, {booking.lng.toFixed(5)}
                </Typography>
              </div>
            </div>

            {booking.note ? (
              <div className="flex gap-[var(--space-3)]">
                <NotebookPen
                  className="mt-0.5 h-4 w-4 shrink-0 text-primary"
                  aria-hidden
                />
                <div>
                  <Typography
                    variant="caption"
                    className="mb-1 block text-muted"
                  >
                    Notes
                  </Typography>
                  <Typography variant="body">“{booking.note}”</Typography>
                </div>
              </div>
            ) : null}

            {service ? (
              <div className="rounded-[var(--radius-lg)] border border-border bg-secondary/40 px-[var(--space-4)] py-[var(--space-3)]">
                <Typography variant="caption" className="mb-1 block text-muted">
                  Your service base for this listing
                </Typography>
                <Typography variant="body">{service.address}</Typography>
                <Typography variant="caption" className="mt-1 block text-muted">
                  Coverage radius ~{service.radiusKm} km
                </Typography>
              </div>
            ) : null}
          </dl>

          <BookingRequestActions
            booking={booking}
            unreadMessages={unreadMessages}
            chatOpen={chatOpen && Boolean(threadId)}
            busy={statusBusy}
            unlockBusy={unlockBusy}
            onAccept={(id) => {
              void handleAccept(id);
            }}
            onDecline={(id) => {
              void handleDecline(id);
            }}
            onComplete={(id) => {
              void handleComplete(id);
            }}
            onOpenChat={() => {
              if (!booking.contactUnlocked) {
                setUnlockConfirmOpen(true);
                return;
              }
              openChatForRequest(currentProvider.id, booking);
            }}
            onUnlockContact={() => {
              setUnlockConfirmOpen(true);
            }}
          />
        </section>

        <div className="relative min-h-[32rem] lg:sticky lg:top-6 lg:self-start">
          <BookingTripPanel origin={origin} destination={destination} />

          {chatOpen && threadId ? (
            <div className="absolute inset-0 z-20 flex flex-col p-[var(--space-2)] sm:p-[var(--space-3)]">
              <div
                className="absolute inset-0 rounded-[var(--radius-xl)] bg-foreground/25"
                aria-hidden
              />
              <div className="relative z-10 flex min-h-0 flex-1 flex-col">
                <BookingInlineChat
                  threadId={threadId}
                  serviceTitle={booking.serviceTitle}
                  seekerName={booking.seekerName}
                  onClose={() => setChatOpen(false)}
                />
              </div>
            </div>
          ) : null}
        </div>
      </div>

      <ConfirmDialog
        open={unlockConfirmOpen}
        title="Unlock seeker contact?"
        description="Spend 1 token to reveal this seeker’s phone and enable chat. You can still accept or decline the booking without unlocking."
        confirmLabel="Unlock · 1 token"
        cancelLabel="Not now"
        busy={unlockBusy}
        onConfirm={() => {
          void handleUnlockContact();
        }}
        onCancel={() => setUnlockConfirmOpen(false)}
      />
    </div>
  );
}
