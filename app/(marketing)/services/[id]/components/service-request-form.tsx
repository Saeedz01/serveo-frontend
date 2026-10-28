"use client";

import { useMemo, useState } from "react";
import {
  Button,
  Input,
  Label,
  Textarea,
  Typography,
  useToast,
} from "@/components/ui";
import { SeekerLocationField } from "@/components/location/seeker-location-field";
import { DEFAULT_MAP_CENTER } from "@/lib/maps/maps-config";
import type { MarketplaceItem } from "@/lib/marketplace";
import {
  enabledAvailabilitySlots,
  formatAvailabilityWindow,
} from "@/lib/prototype-availability";
import {
  formatBookingDateTime,
  fromDateTimeLocalValue,
  toDateTimeLocalValue,
} from "@/lib/prototype-bookings";
import type { BookingLocation, PrototypeService } from "@/lib/prototype-types";
import { useCreateBookingMutation } from "@/service/api";
import {
  getApiErrorMessage,
  getStoredAuthUser,
} from "@/service/auth-session";
import { getAccessToken } from "@/service/splitApiSetting";

type ServiceRequestFormProps = {
  service: MarketplaceItem;
  coverage?: PrototypeService;
};

const emptyLocation = (): BookingLocation => ({
  address: "",
  lat: DEFAULT_MAP_CENTER.lat,
  lng: DEFAULT_MAP_CENTER.lng,
});

function defaultRequestedLocal() {
  const date = new Date();
  date.setHours(date.getHours() + 24, 0, 0, 0);
  return toDateTimeLocalValue(date.toISOString());
}

export function ServiceRequestForm({
  service,
  coverage,
}: ServiceRequestFormProps) {
  const { pushToast } = useToast();
  const [createBookingApi, { isLoading: apiBusy }] = useCreateBookingMutation();
  const [location, setLocation] = useState<BookingLocation>(emptyLocation);
  const [requestedLocal, setRequestedLocal] = useState(defaultRequestedLocal);
  const [note, setNote] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [submittedContact, setSubmittedContact] = useState({
    name: "",
    phone: "",
  });

  const authUser = getStoredAuthUser();
  const hasToken = Boolean(getAccessToken());
  const seekerLoggedIn = authUser?.role === "SEEKER" && hasToken;

  const availabilityHint = useMemo(() => {
    const slots = enabledAvailabilitySlots(coverage?.availability);
    if (slots.length === 0) return null;
    return slots.slice(0, 4).map(formatAvailabilityWindow).join(" · ");
  }, [coverage?.availability]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const nextErrors: Record<string, string> = {};

    if (!location.address.trim()) {
      nextErrors.location = "Enter where you need this service.";
    }
    const requestedAt = fromDateTimeLocalValue(requestedLocal);
    if (!requestedAt) {
      nextErrors.requestedAt = "Choose when you need the service.";
    } else if (new Date(requestedAt).getTime() < Date.now() - 60_000) {
      nextErrors.requestedAt = "Pick a time in the future.";
    }
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    try {
      const result = await createBookingApi({
        serviceId: service.id,
        address: location.address.trim(),
        lat: location.lat,
        lng: location.lng,
        requestedAt,
        note,
      }).unwrap();

      setSubmittedContact({
        name: result.seekerName,
        phone: result.seekerPhone ?? "",
      });
      setSubmitted(true);
      pushToast({
        tone: "success",
        title: "Request sent",
        description: "The provider can now review your booking request.",
      });
    } catch (error) {
      const message = getApiErrorMessage(
        error,
        "Could not send booking request. Try again.",
      );
      pushToast({
        tone: "error",
        title: "Request failed",
        description: message,
      });
    }
  };

  if (!seekerLoggedIn) {
    return (
      <div className="space-y-[var(--space-4)] rounded-[var(--radius-xl)] border border-border bg-surface p-[var(--space-5)] shadow-[0_18px_40px_-34px_rgba(92,61,145,0.4)]">
        <div>
          <Typography variant="h3" className="mb-[var(--space-2)]">
            Request this service
          </Typography>
          <Typography variant="body" className="text-muted">
            Log in as a seeker to send a booking request to this provider.
          </Typography>
        </div>
        <div className="flex flex-wrap gap-[var(--space-3)]">
          <Button as="a" href="/seeker/login" className="flex-1 sm:flex-none">
            Log in to request
          </Button>
          <Button
            as="a"
            href="/seeker/signup"
            variant="secondary"
            className="flex-1 sm:flex-none"
          >
            Sign up
          </Button>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="rounded-[var(--radius-xl)] border border-success/30 bg-emerald-50 p-[var(--space-5)]">
        <Typography variant="h3" className="mb-[var(--space-2)] text-success">
          Request sent
        </Typography>
        <Typography variant="body" className="mb-[var(--space-4)] text-foreground">
          Thanks, {submittedContact.name}. The provider has your phone (
          {submittedContact.phone}), location ({location.address}), and requested
          time (
          {formatBookingDateTime(fromDateTimeLocalValue(requestedLocal))}).
        </Typography>
        <Button
          as="a"
          href="/seeker/dashboard"
          variant="secondary"
          className="w-full"
        >
          Track this request
        </Button>
      </div>
    );
  }

  return (
    <form
      onSubmit={(event) => {
        void handleSubmit(event);
      }}
      className="space-y-[var(--space-4)] rounded-[var(--radius-xl)] border border-border bg-surface p-[var(--space-5)] shadow-[0_18px_40px_-34px_rgba(92,61,145,0.4)]"
      noValidate
    >
      <div>
        <Typography variant="h3" className="mb-[var(--space-2)]">
          Request this service
        </Typography>
        <Typography variant="body" className="text-muted">
          Tell the provider where and when you need help.
        </Typography>
        <Typography variant="caption" className="mt-2 block text-muted">
          Signed in as {authUser?.name}. Your name and phone from your account
          will be shared with the provider.
        </Typography>
      </div>

      <SeekerLocationField
        value={location}
        onChange={setLocation}
        error={errors.location}
      />

      <div>
        <Label htmlFor="seeker-requested-at">When do you need this?</Label>
        <Input
          id="seeker-requested-at"
          type="datetime-local"
          value={requestedLocal}
          onChange={(event) => setRequestedLocal(event.target.value)}
        />
        {availabilityHint ? (
          <Typography variant="caption" className="mt-2 block text-muted">
            Provider hours: {availabilityHint}
          </Typography>
        ) : null}
        {errors.requestedAt ? (
          <Typography variant="caption" className="mt-2 block text-error">
            {errors.requestedAt}
          </Typography>
        ) : null}
      </div>

      <div>
        <Label htmlFor="seeker-note">Notes (optional)</Label>
        <Textarea
          id="seeker-note"
          value={note}
          onChange={(event) => setNote(event.target.value)}
          placeholder="Tell the provider what you need help with."
        />
      </div>

      <Button type="submit" className="w-full" disabled={apiBusy}>
        {apiBusy ? "Sending..." : "Send booking request"}
      </Button>
    </form>
  );
}
