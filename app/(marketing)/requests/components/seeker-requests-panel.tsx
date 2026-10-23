"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Button,
  Container,
  EmptyState,
  PageHeader,
  Typography,
} from "@/components/ui";
import { usePrototype } from "@/components/prototype/prototype-provider";
import {
  useGetMyBookingsQuery,
  useGetMyJobsQuery,
} from "@/service/api";
import { getStoredAuthUser } from "@/service/auth-session";
import { getAccessToken } from "@/service/splitApiSetting";
import { SeekerJobPosts } from "./seeker-job-posts";
import { SeekerRequestsList } from "./seeker-requests-list";

type RequestsTab = "bookings" | "jobs";

type SeekerRequestsPanelProps = {
  initialTab?: RequestsTab;
};

export function SeekerRequestsPanel({
  initialTab = "bookings",
}: SeekerRequestsPanelProps) {
  const { ready } = usePrototype();
  const [tab, setTab] = useState<RequestsTab>(initialTab);

  const authUser = getStoredAuthUser();
  const hasToken = Boolean(getAccessToken());
  const seekerLoggedIn = authUser?.role === "SEEKER" && hasToken;

  const {
    data: bookings = [],
    isLoading: bookingsLoading,
    isFetching: bookingsFetching,
  } = useGetMyBookingsQuery(undefined, { skip: !seekerLoggedIn });

  const {
    data: jobs = [],
    isLoading: jobsLoading,
    isFetching: jobsFetching,
  } = useGetMyJobsQuery(undefined, { skip: !seekerLoggedIn });

  useEffect(() => {
    setTab(initialTab);
  }, [initialTab]);

  if (!ready) {
    return (
      <Container className="py-[var(--space-8)]">
        <Typography variant="body">Loading your requests...</Typography>
      </Container>
    );
  }

  if (!seekerLoggedIn) {
    return (
      <Container className="py-[var(--space-6)] lg:py-[var(--space-8)]">
        <div className="mb-[var(--space-6)]">
          <PageHeader
            tone="primary"
            eyebrow="Seeker"
            title="My requests"
            description="Sign in with your seeker account to view bookings and job posts."
          />
        </div>
        <EmptyState
          title="Log in to continue"
          description="Create a seeker account or log in to track your activity."
          action={
            <div className="flex flex-wrap justify-center gap-3">
              <Button as="a" href="/seeker/login">
                Log in
              </Button>
              <Button as="a" href="/seeker/signup" variant="secondary">
                Sign up
              </Button>
            </div>
          }
        />
        <Typography
          variant="body"
          className="mx-auto mt-[var(--space-5)] max-w-md text-center text-muted"
        >
          New here?{" "}
          <Link
            href="/seeker/signup"
            className="font-medium text-primary hover:underline"
          >
            Create a seeker account
          </Link>
          .
        </Typography>
      </Container>
    );
  }

  const displayName = authUser?.name ?? "there";
  const bookingsBusy = bookingsLoading || bookingsFetching;
  const jobsBusy = jobsLoading || jobsFetching;

  return (
    <Container className="py-[var(--space-6)] lg:py-[var(--space-8)]">
      <div className="mb-[var(--space-6)] space-y-[var(--space-4)]">
        <PageHeader
          tone="primary"
          eyebrow="Seeker"
          title="My requests"
          description={`Signed in as ${displayName}. Bookings and jobs are loaded from the server.`}
        />
        <div className="flex flex-wrap gap-[var(--space-2)]">
          <Button
            type="button"
            variant={tab === "bookings" ? "primary" : "secondary"}
            className="h-8 min-h-8 rounded-[var(--radius-full)] px-3.5 text-[length:var(--text-sm)]"
            onClick={() => setTab("bookings")}
          >
            Bookings ({bookingsBusy ? "…" : bookings.length})
          </Button>
          <Button
            type="button"
            variant={tab === "jobs" ? "primary" : "secondary"}
            className="h-8 min-h-8 rounded-[var(--radius-full)] px-3.5 text-[length:var(--text-sm)]"
            onClick={() => setTab("jobs")}
          >
            My job posts ({jobsBusy ? "…" : jobs.length})
          </Button>
        </div>
      </div>

      {tab === "bookings" ? (
        bookingsBusy ? (
          <Typography variant="body">Loading bookings from server...</Typography>
        ) : (
          <SeekerRequestsList bookings={bookings} seekerName={displayName} />
        )
      ) : jobsBusy ? (
        <Typography variant="body">Loading jobs from server...</Typography>
      ) : (
        <SeekerJobPosts jobs={jobs} />
      )}
    </Container>
  );
}
