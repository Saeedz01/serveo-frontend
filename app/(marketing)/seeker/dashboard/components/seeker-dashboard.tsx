"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  ArrowRight,
  Briefcase,
  ClipboardList,
  MessageSquare,
  Plus,
} from "lucide-react";
import {
  Button,
  EmptyState,
  PageHeader,
  Typography,
} from "@/components/ui";
import { usePrototype } from "@/components/prototype/prototype-provider";
import {
  parseSeekerTab,
  type SeekerDashboardTab,
} from "@/lib/seeker-dashboard-tab";
import { SeekerJobPosts } from "@/app/(marketing)/requests/components/seeker-job-posts";
import { SeekerRequestsList } from "@/app/(marketing)/requests/components/seeker-requests-list";
import {
  useGetMyBookingsQuery,
  useGetMyJobsQuery,
} from "@/service/api";
import { getStoredAuthUser } from "@/service/auth-session";
import { getAccessToken } from "@/service/splitApiSetting";
import { SeekerChatPlaceholder } from "./seeker-chat-placeholder";

type SeekerDashboardProps = {
  initialTab?: SeekerDashboardTab;
  initialThreadId?: string | null;
};

export function SeekerDashboard({
  initialTab = "overview",
  initialThreadId = null,
}: SeekerDashboardProps) {
  const { ready } = usePrototype();
  const searchParams = useSearchParams();
  const rawTab = searchParams.get("tab");
  const threadFromUrl = searchParams.get("thread")?.trim() || null;
  const tab: SeekerDashboardTab =
    threadFromUrl && !rawTab
      ? "messages"
      : rawTab
        ? parseSeekerTab(rawTab)
        : initialTab;
  const threadId = threadFromUrl ?? initialThreadId;

  const authUser = getStoredAuthUser();
  const hasToken = Boolean(getAccessToken());
  const seekerLoggedIn = authUser?.role === "SEEKER" && hasToken;

  const {
    data: bookings = [],
    isLoading: bookingsLoading,
  } = useGetMyBookingsQuery(undefined, {
    skip: !seekerLoggedIn,
  });

  const {
    data: jobs = [],
    isLoading: jobsLoading,
  } = useGetMyJobsQuery(undefined, {
    skip: !seekerLoggedIn,
  });

  if (!ready) {
    return <Typography variant="body">Loading your dashboard...</Typography>;
  }

  if (!seekerLoggedIn) {
    return (
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
    );
  }

  const displayName = authUser?.name ?? "there";
  // Only block the UI on the first load — background refetches keep cached data visible.
  const bookingsBusy = bookingsLoading;
  const jobsBusy = jobsLoading;
  const pendingBookings = bookings.filter(
    (booking) =>
      booking.status === "pending" || booking.status === "negotiating",
  ).length;
  const openJobs = jobs.filter((job) => job.status === "open").length;
  const bookedCount = bookings.filter(
    (booking) => booking.status === "accepted",
  ).length;

  if (tab === "overview") {
    return (
      <div className="space-y-[var(--space-6)]">
        <PageHeader
          tone="primary"
          eyebrow="Seeker workspace"
          title={`Welcome, ${displayName}`}
          description="Track booking requests, manage job posts, and message providers from one place."
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
                as="a"
                href="/"
                variant="onPrimary"
                className="rounded-[var(--radius-full)]"
              >
                Browse services
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
              href: "/seeker/dashboard?tab=requests",
              icon: ClipboardList,
            },
            {
              label: "Open job posts",
              value: jobsBusy ? "…" : openJobs,
              hint: "Waiting for bids",
              href: "/seeker/dashboard?tab=jobs",
              icon: Briefcase,
            },
            {
              label: "Booked",
              value: bookingsBusy ? "…" : bookedCount,
              hint: "Confirmed with a provider",
              href: "/seeker/dashboard?tab=requests",
              icon: MessageSquare,
            },
          ].map((stat) => {
            const Icon = stat.icon;
            return (
              <Link
                key={stat.label}
                href={stat.href}
                className="group rounded-[var(--radius-xl)] border border-border bg-surface p-[var(--space-5)] transition-colors hover:border-primary/30 hover:bg-primary-soft/30 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              >
                <div className="mb-[var(--space-3)] flex items-center justify-between gap-3">
                  <Typography
                    variant="caption"
                    className="block font-medium text-muted"
                  >
                    {stat.label}
                  </Typography>
                  <span className="inline-flex h-8 w-8 items-center justify-center rounded-[var(--radius-md)] bg-primary-soft text-primary">
                    <Icon className="h-4 w-4" aria-hidden />
                  </span>
                </div>
                <Typography variant="h2" className="mb-1">
                  {stat.value}
                </Typography>
                <Typography
                  variant="caption"
                  className="inline-flex items-center gap-1 text-muted group-hover:text-primary"
                >
                  {stat.hint}
                  <ArrowRight className="h-3.5 w-3.5" aria-hidden />
                </Typography>
              </Link>
            );
          })}
        </div>

        <section className="rounded-[var(--radius-xl)] border border-border bg-surface p-[var(--space-5)]">
          <Typography variant="h3" className="mb-[var(--space-2)]">
            Quick actions
          </Typography>
          <Typography variant="body" className="mb-[var(--space-4)] text-muted">
            Jump into the work you already started, or find a new provider.
          </Typography>
          <div className="flex flex-wrap gap-[var(--space-3)]">
            <Button as="a" href="/seeker/dashboard?tab=requests">
              View requests
            </Button>
            <Button as="a" href="/seeker/dashboard?tab=jobs" variant="secondary">
              View jobs
            </Button>
            <Button
              as="a"
              href="/seeker/dashboard?tab=messages"
              variant="secondary"
            >
              Open messages
            </Button>
          </div>
        </section>
      </div>
    );
  }

  if (tab === "requests") {
    return (
      <div className="space-y-[var(--space-5)]">
        <div className="flex flex-col gap-[var(--space-3)] sm:flex-row sm:items-end sm:justify-between">
          <div>
            <Typography
              variant="caption"
              className="mb-2 block font-semibold tracking-wide text-primary uppercase"
            >
              Booking requests
            </Typography>
            <Typography variant="h1" className="mb-1">
              Your requests
            </Typography>
            <Typography variant="body" className="text-muted">
              Track every service request and withdraw ones still waiting.
            </Typography>
          </div>
          <Button as="a" href="/" variant="secondary">
            Browse services
          </Button>
        </div>
        {bookingsBusy ? (
          <Typography variant="body">Loading requests...</Typography>
        ) : (
          <SeekerRequestsList bookings={bookings} seekerName={displayName} />
        )}
      </div>
    );
  }

  if (tab === "jobs") {
    return (
      <div className="space-y-[var(--space-5)]">
        <div className="flex flex-col gap-[var(--space-3)] sm:flex-row sm:items-end sm:justify-between">
          <div>
            <Typography
              variant="caption"
              className="mb-2 block font-semibold tracking-wide text-primary uppercase"
            >
              Job board
            </Typography>
            <Typography variant="h1" className="mb-1">
              Your job posts
            </Typography>
            <Typography variant="body" className="text-muted">
              Open posts are visible to providers with matching published
              services.
            </Typography>
          </div>
          <Button as="a" href="/jobs/new">
            <Plus className="h-4 w-4" aria-hidden />
            Post a job
          </Button>
        </div>
        {jobsBusy ? (
          <Typography variant="body">Loading jobs...</Typography>
        ) : (
          <SeekerJobPosts jobs={jobs} />
        )}
      </div>
    );
  }

  return (
    <div className="space-y-[var(--space-5)]">
      <div>
        <Typography
          variant="caption"
          className="mb-2 block font-semibold tracking-wide text-primary uppercase"
        >
          Inbox
        </Typography>
        <Typography variant="h1" className="mb-1">
          Messages
        </Typography>
        <Typography variant="body" className="text-muted">
          Chat with providers about bookings and service requests.
        </Typography>
      </div>
      <SeekerChatPlaceholder threadId={threadId} />
    </div>
  );
}
