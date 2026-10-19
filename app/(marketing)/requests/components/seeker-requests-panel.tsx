"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Button,
  Container,
  PageHeader,
  Typography,
} from "@/components/ui";
import { usePrototype } from "@/components/prototype/prototype-provider";
import { isSeekerAccount } from "@/lib/prototype-types";
import type { BookingDto, JobDto } from "@/service/api";
import {
  useGetMyBookingsQuery,
  useGetMyJobsQuery,
  useGuestLookupBookingsMutation,
  useGuestLookupJobsMutation,
} from "@/service/api";
import { getStoredAuthUser } from "@/service/auth-session";
import { getAccessToken } from "@/service/splitApiSetting";
import { SeekerJobPosts } from "./seeker-job-posts";
import { SeekerRequestLookup } from "./seeker-request-lookup";
import { SeekerRequestsList } from "./seeker-requests-list";

type RequestsTab = "bookings" | "jobs";

type SeekerRequestsPanelProps = {
  initialTab?: RequestsTab;
};

export function SeekerRequestsPanel({
  initialTab = "bookings",
}: SeekerRequestsPanelProps) {
  const { ready, currentSeeker, clearSeekerSession } = usePrototype();
  const [tab, setTab] = useState<RequestsTab>(initialTab);
  const [guestBookings, setGuestBookings] = useState<BookingDto[] | null>(null);
  const [guestJobs, setGuestJobs] = useState<JobDto[] | null>(null);
  const [guestLookupBookings, { isLoading: guestBookingsLoading }] =
    useGuestLookupBookingsMutation();
  const [guestLookupJobs, { isLoading: guestJobsLoading }] =
    useGuestLookupJobsMutation();

  const authUser = getStoredAuthUser();
  const hasToken = Boolean(getAccessToken());
  const accountApi = authUser?.role === "SEEKER" && hasToken;
  const accountSession = isSeekerAccount(currentSeeker);

  const {
    data: accountBookings = [],
    isLoading: accountBookingsLoading,
    isFetching: accountBookingsFetching,
  } = useGetMyBookingsQuery(undefined, { skip: !accountApi });

  const {
    data: accountJobs = [],
    isLoading: accountJobsLoading,
    isFetching: accountJobsFetching,
  } = useGetMyJobsQuery(undefined, { skip: !accountApi });

  useEffect(() => {
    setTab(initialTab);
  }, [initialTab]);

  // Guest session: load bookings + jobs from DB by phone.
  useEffect(() => {
    if (!ready || accountApi || !currentSeeker || accountSession) return;

    let cancelled = false;
    const identity = {
      phone: currentSeeker.phone,
      name: currentSeeker.name,
    };

    void Promise.all([
      guestLookupBookings(identity).unwrap(),
      guestLookupJobs(identity).unwrap(),
    ])
      .then(([bookings, jobs]) => {
        if (cancelled) return;
        setGuestBookings(bookings);
        setGuestJobs(jobs);
      })
      .catch(() => {
        if (cancelled) return;
        setGuestBookings([]);
        setGuestJobs([]);
      });

    return () => {
      cancelled = true;
    };
  }, [
    accountApi,
    accountSession,
    currentSeeker,
    guestLookupBookings,
    guestLookupJobs,
    ready,
  ]);

  useEffect(() => {
    if (accountApi) {
      setGuestBookings(null);
      setGuestJobs(null);
    }
  }, [accountApi]);

  if (!ready) {
    return (
      <Container className="py-[var(--space-8)]">
        <Typography variant="body">Loading your requests...</Typography>
      </Container>
    );
  }

  if (!currentSeeker && !accountApi) {
    return (
      <Container className="py-[var(--space-6)] lg:py-[var(--space-8)]">
        <div className="mb-[var(--space-6)]">
          <PageHeader
            tone="primary"
            eyebrow="Seeker"
            title="My requests"
            description="Use as a guest with name and phone, or sign in with your phone to reopen your activity."
          />
        </div>
        <SeekerRequestLookup
          onFound={({ bookings, jobs }) => {
            setGuestBookings(bookings);
            setGuestJobs(jobs);
          }}
        />
        <Typography
          variant="body"
          className="mx-auto mt-[var(--space-5)] max-w-md text-center text-muted"
        >
          Have an account?{" "}
          <Link
            href="/seeker/login"
            className="font-medium text-primary hover:underline"
          >
            Log in
          </Link>{" "}
          or{" "}
          <Link
            href="/seeker/signup"
            className="font-medium text-primary hover:underline"
          >
            sign up
          </Link>{" "}
          to track requests without looking them up each time.
        </Typography>
      </Container>
    );
  }

  const bookings = accountApi ? accountBookings : (guestBookings ?? []);
  const jobs = accountApi ? accountJobs : (guestJobs ?? []);
  const bookingsLoading =
    (accountApi && (accountBookingsLoading || accountBookingsFetching)) ||
    (!accountApi && guestBookings === null && guestBookingsLoading);
  const jobsLoading =
    (accountApi && (accountJobsLoading || accountJobsFetching)) ||
    (!accountApi && guestJobs === null && guestJobsLoading);
  const displayName = authUser?.name ?? currentSeeker?.name ?? "there";

  return (
    <Container className="py-[var(--space-6)] lg:py-[var(--space-8)]">
      <div className="mb-[var(--space-6)] space-y-[var(--space-4)]">
        <PageHeader
          tone="primary"
          eyebrow="Seeker"
          title="My requests"
          description={
            accountApi || accountSession
              ? `Signed in as ${displayName}. Bookings and jobs are loaded from the server.`
              : `Tracking guest requests for ${displayName}.`
          }
          actions={
            currentSeeker ? (
              <Button
                type="button"
                variant="inverse"
                className="rounded-[var(--radius-full)]"
                onClick={() => {
                  setGuestBookings(null);
                  setGuestJobs(null);
                  clearSeekerSession();
                }}
              >
                {accountSession ? "Log out" : "Look up another phone"}
              </Button>
            ) : undefined
          }
        />
        {!accountApi && !accountSession ? (
          <Typography variant="body" className="text-muted">
            Create an account to reopen this list after you switch browsers.{" "}
            <Link
              href="/seeker/signup"
              className="font-medium text-primary hover:underline"
            >
              Sign up
            </Link>
          </Typography>
        ) : null}
        <div className="flex flex-wrap gap-[var(--space-2)]">
          <Button
            type="button"
            variant={tab === "bookings" ? "primary" : "secondary"}
            className="h-8 min-h-8 rounded-[var(--radius-full)] px-3.5 text-[length:var(--text-sm)]"
            onClick={() => setTab("bookings")}
          >
            Bookings ({bookingsLoading ? "…" : bookings.length})
          </Button>
          <Button
            type="button"
            variant={tab === "jobs" ? "primary" : "secondary"}
            className="h-8 min-h-8 rounded-[var(--radius-full)] px-3.5 text-[length:var(--text-sm)]"
            onClick={() => setTab("jobs")}
          >
            My job posts ({jobsLoading ? "…" : jobs.length})
          </Button>
        </div>
      </div>

      {tab === "bookings" ? (
        bookingsLoading ? (
          <Typography variant="body">Loading bookings from server...</Typography>
        ) : (
          <SeekerRequestsList
            bookings={bookings}
            seekerName={displayName}
            guestIdentity={
              accountApi || !currentSeeker
                ? null
                : { phone: currentSeeker.phone, name: currentSeeker.name }
            }
            onWithdrawn={(bookingId) => {
              if (accountApi) return;
              setGuestBookings((prev) =>
                (prev ?? []).filter((item) => item.id !== bookingId),
              );
            }}
          />
        )
      ) : jobsLoading ? (
        <Typography variant="body">Loading jobs from server...</Typography>
      ) : (
        <SeekerJobPosts jobs={jobs} />
      )}
    </Container>
  );
}
