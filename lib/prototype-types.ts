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

/** Seeker service-request location (Maps-ready). */
export type BookingLocation = {
  address: string;
  lat: number;
  lng: number;
};

export type PrototypeBooking = {
  id: string;
  serviceId: string;
  providerId: string;
  serviceTitle: string;
  seekerName: string;
  seekerPhone: string;
  /** Links the booking to a lightweight seeker session when known. */
  seekerId?: string;
  /** Where the seeker needs the service. */
  location: BookingLocation;
  note: string;
  status: BookingStatus;
  createdAt: string;
};

export type NotificationType = "booking_request" | "system" | "chat_message";

export type PrototypeNotification = {
  id: string;
  providerId: string;
  type: NotificationType;
  title: string;
  body: string;
  href?: string;
  read: boolean;
  createdAt: string;
};

export type PrototypeSeeker = {
  id: string;
  name: string;
  phone: string;
  createdAt: string;
};

export type ChatParticipantRole = "seeker" | "provider" | "admin";

export type ChatParticipant = {
  role: ChatParticipantRole;
  id: string;
};

export type ChatMessageStatus = "sending" | "sent" | "delivered" | "failed";

export type ChatThread = {
  id: string;
  participants: [ChatParticipant, ChatParticipant];
  /** Snapshot of display names by participant key (role:id). */
  participantNames?: Record<string, string>;
  contextServiceId?: string;
  contextServiceTitle?: string;
  lastMessageAt: string;
  lastMessagePreview: string;
  createdAt: string;
};

export type ChatMessage = {
  id: string;
  threadId: string;
  sender: ChatParticipant;
  body: string;
  createdAt: string;
  status: ChatMessageStatus;
  serviceId?: string;
};

export type ChatReadState = {
  threadId: string;
  participantKey: string;
  lastReadAt: string;
};

export const ADMIN_PARTICIPANT: ChatParticipant = {
  role: "admin",
  id: "admin",
};

export type PrototypeState = {
  currentProviderId: string | null;
  currentSeekerId: string | null;
  adminAuthenticated: boolean;
  providers: PrototypeProvider[];
  seekers: PrototypeSeeker[];
  services: PrototypeService[];
  bookings: PrototypeBooking[];
  notifications: PrototypeNotification[];
  chatThreads: ChatThread[];
  chatMessages: ChatMessage[];
  chatReadStates: ChatReadState[];
};

export type RegisterProviderInput = {
  name: string;
  phone: string;
  password: string;
  idFrontUrl: string;
  idBackUrl: string;
};

export type UpdateProviderProfileInput = {
  name: string;
  phone: string;
  /** When omitted or empty, the existing password is kept. */
  password?: string;
};

/** Default admin credentials for the prototype console. */
export const DEFAULT_ADMIN = {
  email: "admin@serveo.com",
  password: "Admin123!",
} as const;

/** Default provider credentials pre-filled on the login form. */
export const DEFAULT_PROVIDER = {
  name: "Test Provider",
  phone: "03000000000003",
  password: "Test provider",
} as const;

/** Shared demo password for other seeded provider accounts. */
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
  seekerId?: string;
  location: BookingLocation;
  note?: string;
};

export function formatServicePrice(amount: number, unit: PriceUnit): string {
  const value = Number.isFinite(amount) ? amount : 0;
  if (unit === "hour") return `$${value}/hr`;
  if (unit === "flat") return `Flat rate $${value}`;
  return `Projects starting at $${value}`;
}
