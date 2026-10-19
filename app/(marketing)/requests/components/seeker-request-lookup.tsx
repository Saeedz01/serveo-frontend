"use client";

import { useState } from "react";
import Link from "next/link";
import { Button, Input, Label, Typography, useToast } from "@/components/ui";
import { usePrototype } from "@/components/prototype/prototype-provider";
import type { BookingDto, JobDto } from "@/service/api";
import {
  useGuestLookupBookingsMutation,
  useGuestLookupJobsMutation,
} from "@/service/api";
import { getApiErrorMessage } from "@/service/auth-session";

type SeekerRequestLookupProps = {
  onFound: (result: { bookings: BookingDto[]; jobs: JobDto[] }) => void;
};

function isValidPhone(value: string) {
  return /^[+()\d\s-]{8,}$/.test(value.trim());
}

export function SeekerRequestLookup({ onFound }: SeekerRequestLookupProps) {
  const { identifySeeker } = usePrototype();
  const { pushToast } = useToast();
  const [guestLookupBookings, { isLoading: bookingsLoading }] =
    useGuestLookupBookingsMutation();
  const [guestLookupJobs, { isLoading: jobsLoading }] =
    useGuestLookupJobsMutation();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState<string | null>(null);
  const isLoading = bookingsLoading || jobsLoading;

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!name.trim()) {
      setError("Enter the name you used on your request.");
      return;
    }
    if (!isValidPhone(phone)) {
      setError("Enter a valid phone number.");
      return;
    }

    try {
      const identity = { name: name.trim(), phone: phone.trim() };
      const [bookings, jobs] = await Promise.all([
        guestLookupBookings(identity).unwrap(),
        guestLookupJobs(identity).unwrap(),
      ]);
      identifySeeker({ name, phone });
      setError(null);
      onFound({ bookings, jobs });
      if (bookings.length === 0 && jobs.length === 0) {
        pushToast({
          tone: "info",
          title: "Nothing found",
          description: "No guest bookings or jobs match that name and phone yet.",
        });
      }
    } catch (lookupError) {
      const message = getApiErrorMessage(
        lookupError,
        "Could not look up requests. Try again.",
      );
      setError(message);
      pushToast({
        tone: "error",
        title: "Lookup failed",
        description: message,
      });
    }
  };

  return (
    <form
      onSubmit={(event) => {
        void handleSubmit(event);
      }}
      className="mx-auto max-w-md space-y-[var(--space-4)] rounded-[var(--radius-xl)] border border-border bg-surface p-[var(--space-6)]"
      noValidate
    >
      <div>
        <Typography variant="h3" className="mb-[var(--space-2)]">
          Track as a guest
        </Typography>
        <Typography variant="body" className="text-muted">
          Enter the name and phone from your request to see status from the
          server. Prefer an account?{" "}
          <Link
            href="/seeker/login"
            className="font-medium text-primary hover:underline"
          >
            Log in
          </Link>
          .
        </Typography>
      </div>

      <div>
        <Label htmlFor="track-name">Your name</Label>
        <Input
          id="track-name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Jordan Lee"
          autoComplete="name"
        />
      </div>

      <div>
        <Label htmlFor="track-phone">Phone number</Label>
        <Input
          id="track-phone"
          type="tel"
          inputMode="tel"
          value={phone}
          onChange={(event) => setPhone(event.target.value)}
          placeholder="+1 (555) 000-0000"
          autoComplete="tel"
        />
      </div>

      {error ? (
        <Typography variant="caption" className="block text-error">
          {error}
        </Typography>
      ) : null}

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? "Looking up..." : "Show my requests"}
      </Button>
    </form>
  );
}
