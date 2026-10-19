import type { UpdateServiceInput } from "@/lib/prototype-notifications";
import type { RatingAggregate } from "@/lib/prototype-reviews";
import type {
  AvailabilitySlot,
  CreateBookingInput,
  CreateJobBidInput,
  CreateJobPostInput,
  CreateReviewInput,
  CreateServiceInput,
  PrototypeBooking,
  PrototypeJobBid,
  PrototypeJobPost,
  PrototypeNotification,
  PrototypeProvider,
  PrototypeReview,
  PrototypeSeeker,
  PrototypeService,
  PrototypeState,
  RegisterProviderInput,
  RegisterSeekerInput,
  UpdateProviderProfileInput,
} from "@/lib/prototype-types";

export type SubmitReviewOutcome =
  | { ok: true; review: PrototypeReview }
  | { ok: false; reason: string };

export type CreateJobPostOutcome =
  | { ok: true; job: PrototypeJobPost }
  | { ok: false; reason: string };

export type CreateJobBidOutcome =
  | { ok: true; bid: PrototypeJobBid }
  | { ok: false; reason: string };

export type AcceptJobBidOutcome =
  | { ok: true }
  | { ok: false; reason: string };

export type CloseJobPostOutcome =
  | { ok: true }
  | { ok: false; reason: string };

export type ProviderLoginOutcome =
  | { ok: true; provider: PrototypeProvider }
  | { ok: false; reason: "not_found" | "bad_password" };

export type SeekerLoginOutcome =
  | { ok: true; seeker: PrototypeSeeker }
  | { ok: false; reason: "not_found" | "bad_password" };

export type SeekerRegisterOutcome =
  | { ok: true; seeker: PrototypeSeeker }
  | { ok: false; reason: "phone_taken" | "invalid" };

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
  loginAdmin: (phone: string, password: string) => AdminLoginOutcome;
  logoutAdmin: () => void;
  identifySeeker: (input: {
    name: string;
    phone: string;
  }) => PrototypeSeeker;
  registerSeeker: (input: RegisterSeekerInput) => SeekerRegisterOutcome;
  loginSeeker: (phone: string, password: string) => SeekerLoginOutcome;
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
  submitReview: (input: CreateReviewInput) => SubmitReviewOutcome;
  createJobPost: (input: CreateJobPostInput) => CreateJobPostOutcome;
  createJobBid: (input: CreateJobBidInput) => CreateJobBidOutcome;
  acceptJobBid: (jobId: string, bidId: string) => AcceptJobBidOutcome;
  closeJobPost: (jobId: string) => CloseJobPostOutcome;
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
  reviewsForService: (serviceId: string) => PrototypeReview[];
  ratingForProvider: (providerId: string) => RatingAggregate;
  ratingForService: (serviceId: string) => RatingAggregate;
  reviewForBooking: (bookingId: string) => PrototypeReview | undefined;
  canReviewBooking: (booking: PrototypeBooking) => boolean;
  openJobPosts: () => PrototypeJobPost[];
  jobPostsForCurrentSeeker: () => PrototypeJobPost[];
  getJobPost: (jobId: string) => PrototypeJobPost | undefined;
  bidsForJob: (jobId: string) => PrototypeJobBid[];
  visibleBidsForJob: (jobId: string) => PrototypeJobBid[];
  bidForProviderOnJob: (
    jobId: string,
    providerId: string,
  ) => PrototypeJobBid | undefined;
  liveBidForProviderOnJob: (
    jobId: string,
    providerId: string,
  ) => PrototypeJobBid | undefined;
};
