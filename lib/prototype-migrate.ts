import { ensureCatalogServices } from "./prototype-catalog-services";
import { dedupeChatNotificationsByHref } from "./prototype-notifications";
import {
  DEFAULT_PROVIDER,
  DEMO_PROVIDER_PASSWORD,
  type PrototypeState,
} from "./prototype-types";

function sanitizeThreadId(id: string) {
  return id.replaceAll(":", "_").replaceAll(".", "_");
}

export function migrateState(raw: PrototypeState): PrototypeState {
  const bookings = raw.bookings ?? [];
  const notifications = dedupeChatNotificationsByHref(
    raw.notifications ??
      bookings
        .filter((booking) => booking.status === "pending")
        .map((booking) => ({
          id: `notif-migrated-${booking.id}`,
          providerId: booking.providerId,
          type: "booking_request" as const,
          title: "New booking request",
          body: `${booking.seekerName} requested ${booking.serviceTitle}.`,
          href: "/provider/bookings",
          read: false,
          createdAt: booking.createdAt,
        })),
  );

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
    })),
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
    services: ensureCatalogServices(normalizedServices),
  };
}
