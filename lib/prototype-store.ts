import { migrateState } from "./prototype-migrate";
import { seedState, STORAGE_KEY } from "./prototype-seed";
import {
  DEFAULT_ADMIN,
  type CreateBookingInput,
  type CreateServiceInput,
  type PrototypeBooking,
  type PrototypeService,
  type PrototypeState,
  type RegisterProviderInput,
} from "./prototype-types";

function createId(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 9)}`;
}

export function loadPrototypeState(): PrototypeState {
  if (typeof window === "undefined") {
    return seedState();
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const seeded = seedState();
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(seeded));
      return seeded;
    }
    const parsed = migrateState(JSON.parse(raw) as PrototypeState);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
    return parsed;
  } catch {
    return seedState();
  }
}

function compactMedia(url: string) {
  return url.startsWith("data:") ? "/services/ikea-assembly.jpg" : url;
}

function compactState(state: PrototypeState): PrototypeState {
  return {
    ...state,
    providers: state.providers.map((provider) => ({
      ...provider,
      idFrontUrl: compactMedia(provider.idFrontUrl),
      idBackUrl: compactMedia(provider.idBackUrl),
    })),
    services: state.services.map((service) => ({
      ...service,
      imageUrl: compactMedia(service.imageUrl),
    })),
  };
}

export function savePrototypeState(state: PrototypeState) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    try {
      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(compactState(state)),
      );
    } catch {
      // Keep in-memory state even if browser storage is full.
    }
  }
}

export function registerProvider(
  state: PrototypeState,
  input: RegisterProviderInput,
): PrototypeState {
  const provider = {
    id: createId("prov"),
    name: input.name.trim(),
    phone: input.phone.trim(),
    password: input.password,
    idFrontUrl: input.idFrontUrl,
    idBackUrl: input.idBackUrl,
    status: "pending" as const,
    createdAt: new Date().toISOString(),
  };

  return {
    ...state,
    currentProviderId: provider.id,
    providers: [provider, ...state.providers],
  };
}

export function setProviderStatus(
  state: PrototypeState,
  providerId: string,
  status: "pending" | "verified" | "rejected",
): PrototypeState {
  return {
    ...state,
    providers: state.providers.map((provider) =>
      provider.id === providerId ? { ...provider, status } : provider,
    ),
  };
}

export function verifyProviderAndPublishDrafts(
  state: PrototypeState,
  providerId: string,
): PrototypeState {
  const verified = setProviderStatus(state, providerId, "verified");
  return {
    ...verified,
    services: verified.services.map((service) =>
      service.providerId === providerId && service.status === "draft"
        ? { ...service, status: "published" as const }
        : service,
    ),
  };
}

export function createService(
  state: PrototypeState,
  input: CreateServiceInput,
): PrototypeState {
  const service: PrototypeService = {
    id: createId("svc"),
    ...input,
    title: input.title.trim(),
    description: input.description.trim(),
    address: input.address.trim(),
    categoryId: input.categoryId,
    priceAmount: input.priceAmount,
    priceUnit: input.priceUnit,
    createdAt: new Date().toISOString(),
  };

  return {
    ...state,
    services: [service, ...state.services],
  };
}

export function setServiceStatus(
  state: PrototypeState,
  serviceId: string,
  status: "draft" | "published" | "suspended",
): PrototypeState {
  return {
    ...state,
    services: state.services.map((service) =>
      service.id === serviceId ? { ...service, status } : service,
    ),
  };
}

export function removeService(
  state: PrototypeState,
  serviceId: string,
): PrototypeState {
  return {
    ...state,
    services: state.services.filter((service) => service.id !== serviceId),
  };
}

export function createBooking(
  state: PrototypeState,
  input: CreateBookingInput,
): PrototypeState {
  const booking: PrototypeBooking = {
    id: createId("book"),
    serviceId: input.serviceId,
    providerId: input.providerId,
    serviceTitle: input.serviceTitle,
    seekerName: input.seekerName.trim(),
    seekerPhone: input.seekerPhone.trim(),
    seekerId: input.seekerId,
    location: {
      address: input.location.address.trim(),
      lat: input.location.lat,
      lng: input.location.lng,
    },
    requestedAt: input.requestedAt,
    note: input.note?.trim() ?? "",
    status: "pending",
    createdAt: new Date().toISOString(),
  };

  return {
    ...state,
    bookings: [booking, ...state.bookings],
  };
}

export function setBookingStatus(
  state: PrototypeState,
  bookingId: string,
  status: PrototypeBooking["status"],
): PrototypeState {
  return {
    ...state,
    bookings: state.bookings.map((booking) =>
      booking.id === bookingId ? { ...booking, status } : booking,
    ),
  };
}

export function setCurrentProvider(
  state: PrototypeState,
  providerId: string | null,
): PrototypeState {
  return { ...state, currentProviderId: providerId };
}

export function normalizePhone(phone: string) {
  return phone.replace(/\D/g, "");
}

export function findProviderByPhone(
  state: PrototypeState,
  phone: string,
) {
  const normalized = normalizePhone(phone);
  if (!normalized) return null;
  return (
    state.providers.find(
      (provider) => normalizePhone(provider.phone) === normalized,
    ) ?? null
  );
}

export type ProviderLoginResult =
  | { ok: true; state: PrototypeState; provider: PrototypeState["providers"][number] }
  | { ok: false; state: PrototypeState; reason: "not_found" | "bad_password" };

export function loginProvider(
  state: PrototypeState,
  phone: string,
  password: string,
): ProviderLoginResult {
  const provider = findProviderByPhone(state, phone);
  if (!provider) {
    return { ok: false, state, reason: "not_found" };
  }
  if (provider.password !== password) {
    return { ok: false, state, reason: "bad_password" };
  }
  return {
    ok: true,
    state: setCurrentProvider(state, provider.id),
    provider,
  };
}

export type AdminLoginResult =
  | { ok: true; state: PrototypeState }
  | { ok: false; state: PrototypeState; reason: "bad_credentials" };

export function loginAdmin(
  state: PrototypeState,
  email: string,
  password: string,
): AdminLoginResult {
  const normalizedEmail = email.trim().toLowerCase();
  if (
    normalizedEmail !== DEFAULT_ADMIN.email ||
    password !== DEFAULT_ADMIN.password
  ) {
    return { ok: false, state, reason: "bad_credentials" };
  }
  return {
    ok: true,
    state: { ...state, adminAuthenticated: true },
  };
}

export function logoutAdmin(state: PrototypeState): PrototypeState {
  return { ...state, adminAuthenticated: false };
}

