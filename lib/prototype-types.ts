export type ProviderStatus = "pending" | "verified" | "rejected";
export type ProviderServiceStatus = "draft" | "published" | "suspended";
export type BookingStatus = "pending" | "accepted" | "declined";
export type PriceUnit = "project" | "hour" | "flat";

export type AvailabilitySlot = {
  day: string;
  enabled: boolean;
  start: string;
  end: string;
};

export type PrototypeProvider = {
  id: string;
  name: string;
  phone: string;
  password: string;
  idFrontUrl: string;
  idBackUrl: string;
  status: ProviderStatus;
  createdAt: string;
};

export type PrototypeService = {
  id: string;
  providerId: string;
  categoryId: string;
  title: string;
  description: string;
  imageUrl: string;
  address: string;
  lat: number;
  lng: number;
  radiusKm: number;
  priceAmount: number;
  priceUnit: PriceUnit;
  availability: AvailabilitySlot[];
  status: ProviderServiceStatus;
  createdAt: string;
};

export type PrototypeBooking = {
  id: string;
  serviceId: string;
  providerId: string;
  serviceTitle: string;
  seekerName: string;
  seekerPhone: string;
  note: string;
  status: BookingStatus;
  createdAt: string;
};

export type PrototypeState = {
  currentProviderId: string | null;
  adminAuthenticated: boolean;
  providers: PrototypeProvider[];
  services: PrototypeService[];
  bookings: PrototypeBooking[];
};

export type RegisterProviderInput = {
  name: string;
  phone: string;
  password: string;
  idFrontUrl: string;
  idBackUrl: string;
};

/** Default admin credentials for the prototype console. */
export const DEFAULT_ADMIN = {
  email: "admin@serveo.com",
  password: "Admin123!",
} as const;

/** Shared demo password for seeded provider accounts. */
export const DEMO_PROVIDER_PASSWORD = "Serveo123!";

export type CreateServiceInput = {
  providerId: string;
  categoryId: string;
  title: string;
  description: string;
  imageUrl: string;
  address: string;
  lat: number;
  lng: number;
  radiusKm: number;
  priceAmount: number;
  priceUnit: PriceUnit;
  availability: AvailabilitySlot[];
  status: ProviderServiceStatus;
};

export type CreateBookingInput = {
  serviceId: string;
  providerId: string;
  serviceTitle: string;
  seekerName: string;
  seekerPhone: string;
  note?: string;
};

export function formatServicePrice(amount: number, unit: PriceUnit): string {
  const value = Number.isFinite(amount) ? amount : 0;
  if (unit === "hour") return `$${value}/hr`;
  if (unit === "flat") return `Flat rate $${value}`;
  return `Projects starting at $${value}`;
}
