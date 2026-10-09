import type {
  PrototypeNotification,
  PrototypeState,
} from "./prototype-types";

function createId(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 9)}`;
}

export type CreateNotificationInput = {
  providerId: string;
  type: PrototypeNotification["type"];
  title: string;
  body: string;
  href?: string;
  groupKey?: string;
};

export function chatNotificationGroupKey(threadId: string) {
  return `chat:${threadId}`;
}

export function addNotification(
  state: PrototypeState,
  input: CreateNotificationInput,
): PrototypeState {
  const notification: PrototypeNotification = {
    id: createId("notif"),
    providerId: input.providerId,
    type: input.type,
    title: input.title.trim(),
    body: input.body.trim(),
    href: input.href,
    groupKey: input.groupKey,
    read: false,
    createdAt: new Date().toISOString(),
  };

  return {
    ...state,
    notifications: [notification, ...(state.notifications ?? [])],
  };
}

function isSameChatNotification(
  item: PrototypeNotification,
  providerId: string,
  href: string | undefined,
  groupKey: string | undefined,
) {
  if (item.providerId !== providerId || item.type !== "chat_message") {
    return false;
  }
  if (groupKey && item.groupKey === groupKey) return true;
  const normalize = (value: string) => value.split("?")[0] ?? value;
  if (href && item.href && normalize(item.href) === normalize(href)) return true;
  // Legacy rows pointed at /provider/messages/:threadId before booking deep-links.
  if (groupKey?.startsWith("chat:")) {
    const threadId = groupKey.slice("chat:".length);
    if (item.href?.includes(`/provider/messages/${threadId}`)) return true;
    if (item.groupKey === groupKey) return true;
  }
  return false;
}

/**
 * For chat threads: keep a single notification per conversation.
 * A newer message replaces any older chat alert for the same thread.
 */
export function upsertNotificationByHref(
  state: PrototypeState,
  input: CreateNotificationInput,
): PrototypeState {
  if (!input.href && !input.groupKey) {
    return addNotification(state, input);
  }

  const href = input.href;
  const groupKey = input.groupKey;
  const providerId = input.providerId;
  const remaining = (state.notifications ?? []).filter(
    (item) => !isSameChatNotification(item, providerId, href, groupKey),
  );

  const notification: PrototypeNotification = {
    id: createId("notif"),
    providerId,
    type: input.type,
    title: input.title.trim(),
    body: input.body.trim(),
    href,
    groupKey,
    read: false,
    createdAt: new Date().toISOString(),
  };

  return {
    ...state,
    notifications: [notification, ...remaining],
  };
}

function resolveChatGroupKey(
  item: PrototypeNotification,
  threads: PrototypeState["chatThreads"],
): string | undefined {
  if (item.groupKey) return item.groupKey;
  if (item.type !== "chat_message") return undefined;

  const messageMatch = item.href?.match(/\/provider\/messages\/([^/?#]+)/);
  if (messageMatch?.[1]) return chatNotificationGroupKey(messageMatch[1]);

  const bookingMatch = item.href?.match(/\/provider\/bookings\/([^/?#]+)/);
  if (bookingMatch?.[1]) {
    const thread = (threads ?? []).find(
      (entry) => entry.contextBookingId === bookingMatch[1],
    );
    if (thread) return chatNotificationGroupKey(thread.id);
    return `chat-booking:${bookingMatch[1]}`;
  }

  if (item.href) return `chat-href:${item.href}`;
  return undefined;
}

/**
 * Keep only the newest chat notification per conversation.
 * Booking/system alerts are left alone.
 */
export function dedupeChatNotificationsByHref(
  notifications: PrototypeNotification[],
  threads: PrototypeState["chatThreads"] = [],
): PrototypeNotification[] {
  const seen = new Set<string>();
  const sorted = [...notifications]
    .map((item) => ({
      ...item,
      groupKey: resolveChatGroupKey(item, threads) ?? item.groupKey,
    }))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  return sorted.filter((item) => {
    if (item.type !== "chat_message") return true;
    const key = `${item.providerId}::${item.groupKey ?? item.href ?? item.id}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export function markNotificationRead(
  state: PrototypeState,
  notificationId: string,
): PrototypeState {
  return {
    ...state,
    notifications: (state.notifications ?? []).map((item) =>
      item.id === notificationId ? { ...item, read: true } : item,
    ),
  };
}

export function markAllNotificationsRead(
  state: PrototypeState,
  providerId: string,
): PrototypeState {
  return {
    ...state,
    notifications: (state.notifications ?? []).map((item) =>
      item.providerId === providerId ? { ...item, read: true } : item,
    ),
  };
}

export function updateServiceAvailability(
  state: PrototypeState,
  serviceId: string,
  availability: PrototypeState["services"][number]["availability"],
): PrototypeState {
  return {
    ...state,
    services: state.services.map((service) =>
      service.id === serviceId ? { ...service, availability } : service,
    ),
  };
}

export type UpdateServiceInput = {
  categoryId: string;
  title: string;
  description: string;
  imageUrl: string;
  address: string;
  lat: number;
  lng: number;
  radiusKm: number;
  priceAmount: number;
  priceUnit: PrototypeState["services"][number]["priceUnit"];
  availability: PrototypeState["services"][number]["availability"];
  status: PrototypeState["services"][number]["status"];
};

export function updateService(
  state: PrototypeState,
  serviceId: string,
  input: UpdateServiceInput,
): PrototypeState {
  return {
    ...state,
    services: state.services.map((service) =>
      service.id === serviceId
        ? {
            ...service,
            categoryId: input.categoryId,
            title: input.title.trim(),
            description: input.description.trim(),
            imageUrl: input.imageUrl,
            address: input.address.trim(),
            lat: input.lat,
            lng: input.lng,
            radiusKm: input.radiusKm,
            priceAmount: input.priceAmount,
            priceUnit: input.priceUnit,
            availability: input.availability,
            status: input.status,
          }
        : service,
    ),
  };
}
