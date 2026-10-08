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
};

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
    read: false,
    createdAt: new Date().toISOString(),
  };

  return {
    ...state,
    notifications: [notification, ...(state.notifications ?? [])],
  };
}

/**
 * For chat threads: keep a single notification per href.
 * Replaces any older chat notification pointing at the same chat with the latest.
 */
export function upsertNotificationByHref(
  state: PrototypeState,
  input: CreateNotificationInput,
): PrototypeState {
  if (!input.href) {
    return addNotification(state, input);
  }

  const href = input.href;
  const providerId = input.providerId;
  const remaining = (state.notifications ?? []).filter(
    (item) =>
      !(
        item.providerId === providerId &&
        item.href === href &&
        item.type === "chat_message"
      ),
  );

  const notification: PrototypeNotification = {
    id: createId("notif"),
    providerId,
    type: input.type,
    title: input.title.trim(),
    body: input.body.trim(),
    href,
    read: false,
    createdAt: new Date().toISOString(),
  };

  return {
    ...state,
    notifications: [notification, ...remaining],
  };
}

/**
 * Keep only the newest chat notification per provider + chat href.
 * Booking/system alerts are left alone (they often share a list href).
 */
export function dedupeChatNotificationsByHref(
  notifications: PrototypeNotification[],
): PrototypeNotification[] {
  const seen = new Set<string>();
  const sorted = [...notifications].sort((a, b) =>
    b.createdAt.localeCompare(a.createdAt),
  );

  return sorted.filter((item) => {
    if (item.type !== "chat_message" || !item.href) return true;
    const key = `${item.providerId}::${item.href}`;
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
