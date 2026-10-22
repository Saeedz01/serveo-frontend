export type ProviderStatus = "pending" | "verified" | "rejected";
export type ProviderServiceStatus = "draft" | "published" | "suspended";
export type BookingStatus =
  | "pending"
  | "negotiating"
  | "accepted"
  | "declined"
  | "completed";
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
  /** When the seeker needs the service (ISO). */
  requestedAt: string;
  note: string;
  status: BookingStatus;
  createdAt: string;
};

export type NotificationType =
  | "booking_request"
  | "system"
  | "chat_message"
  | "job_post";

export type JobPostStatus = "open" | "awarded" | "closed";
export type JobBidStatus = "pending" | "accepted" | "rejected";

export type PrototypeJobPost = {
  id: string;
  seekerId?: string;
  seekerName: string;
  seekerPhone: string;
  title: string;
  description: string;
  location: BookingLocation;
  status: JobPostStatus;
  createdAt: string;
  awardedBidId?: string;
  awardedBookingId?: string;
};

export type PrototypeJobBid = {
  id: string;
  jobId: string;
  providerId: string;
  providerName: string;
  amount: number;
  note: string;
  status: JobBidStatus;
  createdAt: string;
};

export type CreateJobPostInput = {
  seekerName: string;
  seekerPhone: string;
  seekerId?: string;
  title: string;
  description: string;
  location: BookingLocation;
};

export type CreateJobBidInput = {
  jobId: string;
  providerId: string;
  providerName: string;
  amount: number;
  note?: string;
};

export type PrototypeNotification = {
  id: string;
  providerId: string;
  type: NotificationType;
  title: string;
  body: string;
  href?: string;
  /**
   * Collapses chat alerts for the same conversation.
   * Prefer `chat:${threadId}` so a new message replaces the previous one.
   */
  groupKey?: string;
  read: boolean;
  createdAt: string;
};

export type PrototypeSeeker = {
  id: string;
  name: string;
  /** Contact phone; required for guest identity, set on booking for accounts. */
  phone: string;
  /** Legacy optional field; registered accounts use phone + password. */
  email?: string;
  password?: string;
  createdAt: string;
};

export type RegisterSeekerInput = {
  name: string;
  phone: string;
  password: string;
};

/** Demo registered seeker credentials (pre-filled on seeker login). */
export const DEFAULT_SEEKER = {
  name: "Demo Seeker",
  phone: "03022222222",
  password: "seeker@123",
} as const;

/** True when the seeker registered with phone + password (not guest). */
export function isSeekerAccount(
  seeker: PrototypeSeeker | null | undefined,
): boolean {
  return Boolean(seeker?.password);
}

/** Seeker review after a provider confirms (accepted) a booking. */
export type PrototypeReview = {
  id: string;
  bookingId: string;
  serviceId: string;
  providerId: string;
  seekerId?: string;
  seekerName: string;
  /** Integer 1–5. */
  rating: number;
  body: string;
  createdAt: string;
};

export type CreateReviewInput = {
  bookingId: string;
  rating: number;
  body?: string;
};

export type ChatParticipantRole = "seeker" | "provider" | "admin";

export type ChatParticipant = {
  role: ChatParticipantRole;
  id: string;
};

export type ChatMessageStatus =
  | "sending"
  | "sent"
  | "delivered"
  | "read"
  | "failed";

export type ChatAttachment = {
  id: string;
  name: string;
  mimeType: string;
  sizeBytes: number;
  url: string;
};

export type ChatThread = {
  id: string;
  participants: [ChatParticipant, ChatParticipant];
  /** Snapshot of display names by participant key (role:id). */
  participantNames?: Record<string, string>;
  contextServiceId?: string;
  contextServiceTitle?: string;
  /** Booking that opened negotiation — seekers open chat from My requests. */
  contextBookingId?: string;
  lastMessageAt: string;
  lastMessagePreview: string;
  createdAt: string;
};

export type ChatMessage = {
  id: string;
  threadId: string;
  sender: ChatParticipant;
  body: string;
  attachments?: ChatAttachment[];
  createdAt: string;
  editedAt?: string | null;
  deletedAt?: string | null;
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
  reviews: PrototypeReview[];
  jobPosts: PrototypeJobPost[];
  jobBids: PrototypeJobBid[];
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
  phone: "03011111111",
  password: "admin@123",
} as const;

/** Default provider credentials pre-filled on the login form. */
export const DEFAULT_PROVIDER = {
  name: "Demo Provider",
  phone: "03044595469",
  password: "provider@123",
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
  /** When the seeker needs the service (ISO). */
  requestedAt: string;
  note?: string;
};

export function formatServicePrice(amount: number, unit: PriceUnit): string {
  const value = Number.isFinite(amount) ? amount : 0;
  if (unit === "hour") return `$${value}/hr`;
  if (unit === "flat") return `Flat rate $${value}`;
  return `Projects starting at $${value}`;
}
