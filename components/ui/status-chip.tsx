import { Badge } from "@/components/ui/badge";
import type {
  BookingStatus,
  ProviderServiceStatus,
  ProviderStatus,
} from "@/lib/prototype-types";

const providerTone = {
  pending: "warning",
  verified: "success",
  rejected: "danger",
} as const;

const serviceTone = {
  draft: "neutral",
  published: "success",
  suspended: "danger",
} as const;

const bookingTone = {
  pending: "warning",
  accepted: "success",
  declined: "danger",
} as const;

export function ProviderStatusChip({ status }: { status: ProviderStatus }) {
  return (
    <Badge tone={providerTone[status]}>
      {status === "pending"
        ? "Pending verification"
        : status === "verified"
          ? "Verified"
          : "Rejected"}
    </Badge>
  );
}

export function ServiceStatusChip({ status }: { status: ProviderServiceStatus }) {
  return (
    <Badge tone={serviceTone[status]}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </Badge>
  );
}

export function BookingStatusChip({ status }: { status: BookingStatus }) {
  return (
    <Badge tone={bookingTone[status]}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </Badge>
  );
}
