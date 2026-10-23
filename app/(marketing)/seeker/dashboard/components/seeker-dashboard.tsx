"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Briefcase,
  ClipboardList,
  MessageSquare,
  Plus,
} from "lucide-react";
import {
  Button,
  Container,
  EmptyState,
  PageHeader,
  Typography,
} from "@/components/ui";
import { usePrototype } from "@/components/prototype/prototype-provider";
import { SeekerJobPosts } from "@/app/(marketing)/requests/components/seeker-job-posts";
import { SeekerRequestsList } from "@/app/(marketing)/requests/components/seeker-requests-list";
import {
  useGetMyBookingsQuery,
  useGetMyJobsQuery,
} from "@/service/api";
import {
  clearAuthSession,
  getStoredAuthUser,
} from "@/service/auth-session";
import { getAccessToken } from "@/service/splitApiSetting";
import { SeekerChatPlaceholder } from "./seeker-chat-placeholder";

type DashboardTab = "requests" | "jobs" | "messages";

type SeekerDashboardProps = {
  initialTab?: DashboardTab;
  initialThreadId?: string | null;
};

export function SeekerDashboard({
  initialTab = "requests",
  initialThreadId = null,
}: SeekerDashboardProps) {
  const router = useRouter();
  const { ready, clearSeekerSession } = usePrototype();
  const [tab, setTab] = useState<DashboardTab>(initialTab);
  const [threadId, setThreadId] = useState<string | null>(initialThreadId);

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

  useEffect(() => {
    setThreadId(initialThreadId);
    if (initialThreadId) setTab("messages");
  }, [initialThreadId]);

  const handleLogout = () => {
    clearAuthSession();
    clearSeekerSession();
    router.replace("/");
  };

  if (!ready) {
    return (
      <Container className="py-[var(--space-8)]">
        <Typography variant="body">Loading your dashboard...</Typography>
      </Container>
    );
  }

  if (!seekerLoggedIn) {
    return (
      <Container className="py-[var(--space-6)] lg:py-[var(--space-8)]">
        <div className="mb-[var(--space-6)]">
          <PageHeader
            tone="primary"
            eyebrow="Seeker dashboard"
            title="Track requests and jobs"
            description="Sign in with your seeker account to view booking requests, job posts, and messages."
          />
        </div>
        <EmptyState
          title="Log in to continue"
          description="Create a seeker account or log in to open your dashboard."
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
          Browse services without an account on the{" "}
          <Link
            href="/services"
            className="font-medium text-primary hover:underline"
          >
            services page
          </Link>
          .
        </Typography>
      </Container>
    );
  }

  const displayName = authUser?.name ?? "there";
  const bookingsBusy = bookingsLoading || bookingsFetching;
  const jobsBusy = jobsLoading || jobsFetching;
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
          eyebrow="Seeker account"
          title={`Welcome, ${displayName}`}
          description="Track booking requests, manage job posts, and message providers."
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
              <Button
                type="button"
                variant="onPrimary"
                className="rounded-[var(--radius-full)]"
                onClick={handleLogout}
              >
                Log out
              </Button>
            </>
          }
        />

        <div className="grid gap-[var(--space-4)] sm:grid-cols-3">
          {[
            {
              label: "Active requests",
              value: bookingsBusy ? "…" : pendingBookings,
              hint: "Pending or negotiating",
            },
            {
              label: "Open job posts",
              value: jobsBusy ? "…" : openJobs,
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
            Requests ({bookingsBusy ? "…" : bookings.length})
          </Button>
          <Button
            type="button"
            variant={tab === "jobs" ? "primary" : "secondary"}
            className="h-9 min-h-9 rounded-[var(--radius-full)] px-4 text-[length:var(--text-sm)]"
            onClick={() => setTab("jobs")}
          >
            <Briefcase className="h-3.5 w-3.5" aria-hidden />
            Jobs ({jobsBusy ? "…" : jobs.length})
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
        bookingsBusy ? (
          <Typography variant="body">Loading requests from server...</Typography>
        ) : (
          <SeekerRequestsList bookings={bookings} seekerName={displayName} />
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
          {jobsBusy ? (
            <Typography variant="body">Loading jobs from server...</Typography>
          ) : (
            <SeekerJobPosts jobs={jobs} />
          )}
        </div>
      ) : null}

      {tab === "messages" ? (
        <SeekerChatPlaceholder threadId={threadId} />
      ) : null}
    </Container>
  );
}
