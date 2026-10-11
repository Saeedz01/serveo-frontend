import { ensureCatalogServices } from "./prototype-catalog-services";
import { dedupeChatNotificationsByHref } from "./prototype-notifications";
import { ensureServicesCoverage } from "./prototype-service-coverage";
import {
  DEFAULT_PROVIDER,
  DEMO_PROVIDER_PASSWORD,
  type BookingStatus,
  type PrototypeState,
} from "./prototype-types";

function normalizeBookingStatus(status: string | undefined): BookingStatus {
  if (
    status === "accepted" ||
    status === "declined" ||
    status === "negotiating" ||
    status === "pending"
  ) {
    return status;
  }
  return "pending";
}

function sanitizeThreadId(id: string) {
  return id.replaceAll(":", "_").replaceAll(".", "_");
}

export function migrateState(raw: PrototypeState): PrototypeState {
  const bookings = raw.bookings ?? [];
  const rawNotifications =
    raw.notifications ??
    bookings
      .filter((booking) => booking.status === "pending")
      .map((booking) => ({
        id: `notif-migrated-${booking.id}`,
        providerId: booking.providerId,
        type: "booking_request" as const,
        title: "New booking request",
        body: `${booking.seekerName} requested ${booking.serviceTitle}.`,
        href: `/provider/bookings/${booking.id}`,
        read: false,
        createdAt: booking.createdAt,
      }));

  const notifications = dedupeChatNotificationsByHref(
    rawNotifications,
    raw.chatThreads ?? [],
  ).map((item) => {
    if (item.type !== "chat_message" || !item.href) return item;
    if (!item.href.includes("/provider/bookings/")) return item;
    if (item.href.includes("chat=")) return item;
    const separator = item.href.includes("?") ? "&" : "?";
    return { ...item, href: `${item.href}${separator}chat=1` };
  });

  const normalizedServices = (raw.services ?? []).map((service) => ({
    ...service,
    categoryId: service.categoryId || "assembly",
    priceAmount:
      typeof service.priceAmount === "number" ? service.priceAmount : 49,
    priceUnit: service.priceUnit || "project",
  }));

  return {
    ...raw,
    adminAuthenticated: Boolean(raw.adminAuthenticated),
    currentSeekerId: raw.currentSeekerId ?? null,
    seekers: raw.seekers ?? [],
    chatThreads: (raw.chatThreads ?? []).map((thread) => ({
      ...thread,
      id: sanitizeThreadId(thread.id),
    })),
    chatMessages: (raw.chatMessages ?? []).map((message) => ({
      ...message,
      threadId: sanitizeThreadId(message.threadId),
    })),
    chatReadStates: (raw.chatReadStates ?? []).map((item) => ({
      ...item,
      threadId: sanitizeThreadId(item.threadId),
    })),
    bookings: bookings.map((booking) => ({
      ...booking,
      location: booking.location ?? {
        address: "Address not provided",
        lat: 40.7128,
        lng: -74.006,
      },
      requestedAt: booking.requestedAt || booking.createdAt,
      status: normalizeBookingStatus(booking.status),
    })),
    reviews: raw.reviews ?? [],
    jobPosts: raw.jobPosts ?? [],
    jobBids: raw.jobBids ?? [],
    notifications,
    providers: (raw.providers ?? []).map((provider) => {
      const withPassword = {
        ...provider,
        password: provider.password || DEMO_PROVIDER_PASSWORD,
      };
      if (provider.id === "prov-verified") {
        return {
          ...withPassword,
          name: DEFAULT_PROVIDER.name,
          phone: DEFAULT_PROVIDER.phone,
          password: DEFAULT_PROVIDER.password,
        };
      }
      return withPassword;
    }),
    services: ensureServicesCoverage(ensureCatalogServices(normalizedServices)),
  };
}
