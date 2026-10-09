import type { UpdateServiceInput } from "@/lib/prototype-notifications";
import type {
  AvailabilitySlot,
  CreateBookingInput,
  CreateServiceInput,
  PrototypeBooking,
  PrototypeNotification,
  PrototypeProvider,
  PrototypeSeeker,
  PrototypeService,
  PrototypeState,
  RegisterProviderInput,
  UpdateProviderProfileInput,
} from "@/lib/prototype-types";

export type ProviderLoginOutcome =
  | { ok: true; provider: PrototypeProvider }
  | { ok: false; reason: "not_found" | "bad_password" };

export type AdminLoginOutcome =
  | { ok: true }
  | { ok: false; reason: "bad_credentials" };

export type UpdateProfileOutcome =
  | { ok: true; provider: PrototypeProvider }
  | { ok: false; reason: "not_found" | "phone_taken" };

export type PrototypeContextValue = {
  ready: boolean;
  state: PrototypeState;
  currentProvider: PrototypeProvider | null;
  currentSeeker: PrototypeSeeker | null;
  adminAuthenticated: boolean;
  commit: (updater: (prev: PrototypeState) => PrototypeState) => void;
  registerProvider: (input: RegisterProviderInput) => PrototypeProvider;
  loginProvider: (phone: string, password: string) => ProviderLoginOutcome;
  loginAdmin: (email: string, password: string) => AdminLoginOutcome;
  logoutAdmin: () => void;
  identifySeeker: (input: {
    name: string;
    phone: string;
  }) => PrototypeSeeker;
  clearSeekerSession: () => void;
  updateProviderProfile: (
    input: UpdateProviderProfileInput,
  ) => UpdateProfileOutcome;
  verifyProvider: (providerId: string) => void;
  rejectProvider: (providerId: string) => void;
  createService: (input: CreateServiceInput) => void;
  publishService: (serviceId: string) => void;
  unpublishService: (serviceId: string) => void;
  suspendService: (serviceId: string) => void;
  restoreService: (serviceId: string) => void;
  removeService: (serviceId: string) => void;
  createBooking: (input: CreateBookingInput) => void;
  acceptBooking: (bookingId: string) => void;
  /** Mark request as in negotiation (chat) before final confirm. */
  negotiateBooking: (bookingId: string) => void;
  declineBooking: (bookingId: string) => void;
  updateServiceAvailability: (
    serviceId: string,
    availability: AvailabilitySlot[],
  ) => void;
  updateService: (serviceId: string, input: UpdateServiceInput) => void;
  markNotificationRead: (notificationId: string) => void;
  markAllNotificationsRead: () => void;
  switchProvider: (providerId: string) => void;
  logout: () => void;
  servicesForProvider: (providerId: string) => PrototypeService[];
  bookingsForProvider: (providerId: string) => PrototypeBooking[];
  bookingsForCurrentSeeker: () => PrototypeBooking[];
  notificationsForProvider: (providerId: string) => PrototypeNotification[];
  getPublishedService: (serviceId: string) => PrototypeService | undefined;
};
