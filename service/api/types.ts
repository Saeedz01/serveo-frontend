export type AuthRole = "ADMIN" | "PROVIDER" | "SEEKER";

export type AccountStatus =
  | "ACTIVE"
  | "INACTIVE"
  | "PENDING"
  | "VERIFIED"
  | "REJECTED";

export type AuthUser = {
  id: string;
  /** Provider profile id when role is PROVIDER; otherwise null. */
  profileId: string | null;
  name: string;
  phone: string;
  role: AuthRole;
  status: AccountStatus;
};

export type ServiceCategoryDto = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  keywords: string[];
  isActive: boolean;
  parentId: string | null;
};

export type ServiceCityDto = {
  id: string;
  name: string;
  slug: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type ServiceDto = {
  id: string;
  providerId: string;
  categoryId: string;
  categoryParentId: string | null;
  cityId: string;
  cityName?: string;
  title: string;
  description: string;
  specialty: string | null;
  imageUrl: string;
  address: string;
  lat: number;
  lng: number;
  radiusKm: number;
  priceAmount: number;
  priceUnit: "project" | "hour" | "flat";
  availability: Array<{
    day: string;
    enabled: boolean;
    start: string;
    end: string;
  }>;
  status: "draft" | "published" | "suspended";
  createdAt: string;
  updatedAt: string;
  providerName?: string;
};

export type CreateServiceRequest = {
  categoryId: string;
  cityId: string;
  title: string;
  description: string;
  specialty?: string;
  imageUrl: string;
  address: string;
  lat: number;
  lng: number;
  radiusKm: number;
  priceAmount: number;
  priceUnit: "project" | "hour" | "flat";
  availability: ServiceDto["availability"];
  status?: "draft" | "published" | "suspended";
};

export type CreateServiceCityRequest = {
  name: string;
};

export type UpdateServiceCityRequest = {
  name?: string;
  isActive?: boolean;
};

export type UpdateServiceRequest = Partial<CreateServiceRequest>;

export type AuthResponse = {
  accessToken: string;
  user: AuthUser;
};

export type AdminSignupRequest = {
  name: string;
  phone: string;
  password: string;
};

export type AdminLoginRequest = {
  phone: string;
  password: string;
};

export type SeekerSignupRequest = {
  name: string;
  phone: string;
  password: string;
};

export type SeekerLoginRequest = {
  phone: string;
  password: string;
};

export type ProviderSignupRequest = {
  name: string;
  phone: string;
  password: string;
  idFrontUrl: string;
  idBackUrl: string;
};

export type ProviderLoginRequest = {
  phone: string;
  password: string;
};

export type ApiErrorBody = {
  message?: string | string[];
  statusCode?: number;
  error?: string;
};

export type BookingStatusDto =
  | "pending"
  | "negotiating"
  | "accepted"
  | "declined"
  | "completed";

export type BookingDto = {
  id: string;
  serviceId: string;
  providerId: string;
  /** Present when this booking came from an accepted job bid. */
  jobId?: string | null;
  serviceTitle: string;
  providerName: string;
  providerPhone: string | null;
  seekerId: string;
  seekerName: string;
  seekerPhone: string | null;
  contactUnlocked: boolean;
  address: string;
  lat: number;
  lng: number;
  requestedAt: string;
  note: string;
  status: BookingStatusDto;
  providerViewedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type CreateBookingRequest = {
  serviceId: string;
  address: string;
  lat: number;
  lng: number;
  requestedAt: string;
  note?: string;
};

export type UpdateBookingStatusRequest = {
  status: BookingStatusDto;
};

export type WithdrawBookingResponse = {
  id: string;
  deleted: true;
};

export type JobStatusDto = "open" | "awarded" | "closed";

export type JobAwardedProviderDto = {
  id: string;
  name: string;
  phone: string | null;
  bidPrice: number;
  bookingId: string | null;
};

export type JobDto = {
  id: string;
  categoryId: string;
  categoryName: string;
  categorySlug: string;
  seekerId: string;
  seekerName: string;
  seekerPhone: string | null;
  contactUnlocked: boolean;
  title: string;
  description: string;
  specialty: string | null;
  address: string;
  lat: number;
  lng: number;
  requestedAt: string;
  status: JobStatusDto;
  bidCount: number;
  awardedProvider?: JobAwardedProviderDto | null;
  createdAt: string;
  updatedAt: string;
};

export type JobMatchKind = "exact" | "also_relevant";

export type ProviderJobFeedDto = {
  matched: JobDto[];
  alsoRelevant: JobDto[];
};

export type ContactUnlockTargetType = "BOOKING" | "JOB";

export type TokenBalanceDto = {
  balance: number;
  monthKey: string;
  monthlyGrant: number;
  unlockCost: number;
  grantedThisMonth: boolean;
};

export type UnlockContactRequest = {
  targetType: ContactUnlockTargetType;
  targetId: string;
};

export type UnlockContactResponse = {
  unlocked: true;
  alreadyUnlocked: boolean;
  targetType: ContactUnlockTargetType;
  targetId: string;
  balance: number;
  tokensSpent: number;
};

export type CreateJobRequest = {
  categoryId: string;
  title: string;
  description: string;
  specialty?: string;
  address: string;
  lat: number;
  lng: number;
  requestedAt: string;
};

export type BiddingStatusDto = "pending" | "accepted" | "rejected";

export type BiddingDto = {
  id: string;
  jobId: string;
  providerId: string;
  providerName: string;
  price: number;
  note: string;
  status: BiddingStatusDto;
  createdAt: string;
  updatedAt: string;
};

export type CreateBiddingRequest = {
  jobId: string;
  price: number;
  note?: string;
};

export type AcceptBiddingResponse = {
  bid: BiddingDto;
  booking: BookingDto;
  notification: NotificationDto;
};

export type NotificationDto = {
  id: string;
  providerId: string;
  type: string;
  title: string;
  body: string;
  href: string | null;
  read: boolean;
  createdAt: string;
};

export type MessageParticipantDto = {
  role: "seeker" | "provider" | "admin";
  id: string;
};

export type MessageThreadDto = {
  id: string;
  participants: [MessageParticipantDto, MessageParticipantDto];
  participantNames: Record<string, string>;
  contextServiceId?: string;
  contextServiceTitle?: string;
  contextBookingId?: string;
  lastMessageAt: string;
  lastMessagePreview: string;
  createdAt: string;
  unreadCount: number;
  peer: MessageParticipantDto;
  peerName: string;
};

export type MessageAttachmentDto = {
  id: string;
  name: string;
  mimeType: string;
  sizeBytes: number;
  url: string;
};

export type MessageDto = {
  id: string;
  threadId: string;
  sender: MessageParticipantDto;
  body: string;
  attachments: MessageAttachmentDto[];
  createdAt: string;
  editedAt: string | null;
  deletedAt: string | null;
  status: "sent" | "delivered" | "read";
};

export type MessagePageDto = {
  items: MessageDto[];
  nextCursor: string | null;
  hasMore: boolean;
};

export type OpenMessageThreadRequest = {
  bookingId?: string;
  providerId?: string;
  serviceId?: string;
  serviceTitle?: string;
};

export type SendMessageRequest = {
  body?: string;
  attachments?: Array<{
    name: string;
    mimeType: string;
    sizeBytes: number;
    url: string;
  }>;
};

export type ReviewDto = {
  id: string;
  bookingId: string;
  providerId: string;
  seekerId: string;
  serviceId: string;
  seekerName: string;
  rating: number;
  comment: string;
  helpfulCount: number;
  viewerMarkedHelpful: boolean;
  createdAt: string;
  updatedAt: string;
};

export type ReviewListDto = {
  average: number;
  count: number;
  reviews: ReviewDto[];
};

export type CreateReviewRequest = {
  bookingId: string;
  rating: number;
  comment: string;
};

export type BookingReviewResponse = {
  review: ReviewDto | null;
};
