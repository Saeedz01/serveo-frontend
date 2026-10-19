"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Briefcase,
  ClipboardList,
  MessageSquare,
  Plus,
} from "lucide-react";
import {
  Button,
  Container,
  PageHeader,
  Typography,
} from "@/components/ui";
import { usePrototype } from "@/components/prototype/prototype-provider";
import { SeekerJobPosts } from "@/app/(marketing)/requests/components/seeker-job-posts";
import { SeekerRequestLookup } from "@/app/(marketing)/requests/components/seeker-request-lookup";
import { SeekerRequestsList } from "@/app/(marketing)/requests/components/seeker-requests-list";
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
import { SeekerChatPlaceholder } from "./seeker-chat-placeholder";

type DashboardTab = "requests" | "jobs" | "messages";

type SeekerDashboardProps = {
  initialTab?: DashboardTab;
};

export function SeekerDashboard({
  initialTab = "requests",
}: SeekerDashboardProps) {
  const { ready, currentSeeker, clearSeekerSession } = usePrototype();
  const [tab, setTab] = useState<DashboardTab>(initialTab);
  const [guestBookings, setGuestBookings] = useState<BookingDto[] | null>(null);
  const [guestJobs, setGuestJobs] = useState<JobDto[] | null>(null);
  const [guestLookupBookings, { isLoading: guestBookingsLoading }] =
    useGuestLookupBookingsMutation();
  const [guestLookupJobs, { isLoading: guestJobsLoading }] =
    useGuestLookupJobsMutation();

  const authUser = getStoredAuthUser();
  const hasToken = Boolean(getAccessToken());
  const accountApi = authUser?.role === "SEEKER" && hasToken;
  const accountSession = accountApi || isSeekerAccount(currentSeeker);

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
        <Typography variant="body">Loading your dashboard...</Typography>
      </Container>
    );
  }

  if (!currentSeeker && !accountApi) {
    return (
      <Container className="py-[var(--space-6)] lg:py-[var(--space-8)]">
        <div className="mb-[var(--space-6)]">
          <PageHeader
            tone="primary"
            eyebrow="Seeker dashboard"
            title="Track requests and jobs"
            description="Look up as a guest with name and phone, or sign in to reopen everything on this device."
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
          </Link>
          .
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
  const pendingBookings = bookings.filter(
    (booking) =>
      booking.status === "pending" || booking.status === "negotiating",
  ).length;
  const openJobs = jobs.filter((job) => job.status === "open").length;

  return (
    <Container className="py-[var(--space-6)] lg:py-[var(--space-8)]">
      <div className="mb-[var(--space-6)] space-y-[var(--space-5)]">
        <PageHeader
          tone="primary"
          eyebrow={
            accountApi || accountSession ? "Seeker account" : "Guest session"
          }
          title={`Welcome, ${displayName}`}
          description={
            accountApi || accountSession
              ? "Track booking requests, manage job posts, and (soon) chat with providers."
              : "You’re tracking as a guest. Sign up anytime to keep this list across devices."
          }
          actions={
            <>
              <Button
                as="a"
                href="/jobs/new"
                variant="inverse"
                className="rounded-[var(--radius-full)]"
              >
                <Plus className="h-4 w-4" aria-hidden />
                Post a job
              </Button>
              {currentSeeker ? (
                <Button
                  type="button"
                  variant="onPrimary"
                  className="rounded-[var(--radius-full)]"
                  onClick={() => {
                    setGuestBookings(null);
                    setGuestJobs(null);
                    clearSeekerSession();
                  }}
                >
                  {accountSession ? "Log out" : "Switch phone"}
                </Button>
              ) : null}
            </>
          }
        />

        {!accountApi && !accountSession ? (
          <Typography variant="body" className="text-muted">
            Create an account to reopen this dashboard after you switch browsers.{" "}
            <Link
              href="/seeker/signup"
              className="font-medium text-primary hover:underline"
            >
              Sign up
            </Link>
          </Typography>
        ) : null}

        <div className="grid gap-[var(--space-4)] sm:grid-cols-3">
          {[
            {
              label: "Active requests",
              value: bookingsLoading ? "…" : pendingBookings,
              hint: "Pending or negotiating",
            },
            {
              label: "Open job posts",
              value: jobsLoading ? "…" : openJobs,
              hint: "Waiting for bids",
            },
            {
              label: "Messages",
              value: "—",
              hint: "Chat coming soon",
            },
          ].map((stat) => (
            <div
              key={stat.label}
              className="rounded-[var(--radius-xl)] border border-border bg-surface p-[var(--space-5)]"
            >
              <Typography
                variant="caption"
                className="mb-[var(--space-2)] block text-muted"
              >
                {stat.label}
              </Typography>
              <Typography variant="h2" className="mb-1">
                {stat.value}
              </Typography>
              <Typography variant="caption" className="text-muted">
                {stat.hint}
              </Typography>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap gap-[var(--space-2)]">
          <Button
            type="button"
            variant={tab === "requests" ? "primary" : "secondary"}
            className="h-9 min-h-9 rounded-[var(--radius-full)] px-4 text-[length:var(--text-sm)]"
            onClick={() => setTab("requests")}
          >
            <ClipboardList className="h-3.5 w-3.5" aria-hidden />
            Requests ({bookingsLoading ? "…" : bookings.length})
          </Button>
          <Button
            type="button"
            variant={tab === "jobs" ? "primary" : "secondary"}
            className="h-9 min-h-9 rounded-[var(--radius-full)] px-4 text-[length:var(--text-sm)]"
            onClick={() => setTab("jobs")}
          >
            <Briefcase className="h-3.5 w-3.5" aria-hidden />
            Jobs ({jobsLoading ? "…" : jobs.length})
          </Button>
          <Button
            type="button"
            variant={tab === "messages" ? "primary" : "secondary"}
            className="h-9 min-h-9 rounded-[var(--radius-full)] px-4 text-[length:var(--text-sm)]"
            onClick={() => setTab("messages")}
          >
            <MessageSquare className="h-3.5 w-3.5" aria-hidden />
            Messages
          </Button>
          <Button
            as="a"
            href="/services"
            variant="ghost"
            className="h-9 min-h-9 rounded-[var(--radius-full)] px-4 text-[length:var(--text-sm)]"
          >
            Browse services
          </Button>
        </div>
      </div>

      {tab === "requests" ? (
        bookingsLoading ? (
          <Typography variant="body">Loading requests from server...</Typography>
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
      ) : null}

      {tab === "jobs" ? (
        <div className="space-y-[var(--space-4)]">
          <div className="flex flex-wrap items-center justify-between gap-[var(--space-3)]">
            <Typography variant="body" className="text-muted">
              Jobs you posted — only providers with matching published services
              can see open posts.
            </Typography>
            <Button
              as="a"
              href="/jobs/new"
              className="rounded-[var(--radius-full)]"
            >
              <Plus className="h-4 w-4" aria-hidden />
              Post a job
            </Button>
          </div>
          {jobsLoading ? (
            <Typography variant="body">Loading jobs from server...</Typography>
          ) : (
            <SeekerJobPosts jobs={jobs} />
          )}
        </div>
      ) : null}

      {tab === "messages" ? <SeekerChatPlaceholder /> : null}
    </Container>
  );
}
