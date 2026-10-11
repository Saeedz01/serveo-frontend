"use client";

import { useEffect, useState } from "react";
import {
  Button,
  Container,
  PageHeader,
  Typography,
} from "@/components/ui";
import { usePrototype } from "@/components/prototype/prototype-provider";
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
  const {
    ready,
    currentSeeker,
    bookingsForCurrentSeeker,
    jobPostsForCurrentSeeker,
    clearSeekerSession,
  } = usePrototype();
  const [, setTick] = useState(0);
  const [tab, setTab] = useState<RequestsTab>(initialTab);

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

  if (!currentSeeker) {
    return (
      <Container className="py-[var(--space-6)] lg:py-[var(--space-8)]">
        <div className="mb-[var(--space-6)]">
          <PageHeader
            tone="primary"
            eyebrow="Seeker"
            title="My requests"
            description="No account needed. Track status and read provider messages from your requests."
          />
        </div>
        <SeekerRequestLookup onFound={() => setTick((value) => value + 1)} />
      </Container>
    );
  }

  const bookings = bookingsForCurrentSeeker();
  const jobs = jobPostsForCurrentSeeker();

  return (
    <Container className="py-[var(--space-6)] lg:py-[var(--space-8)]">
      <div className="mb-[var(--space-6)] space-y-[var(--space-4)]">
        <PageHeader
          tone="primary"
          eyebrow="Seeker"
          title="My requests"
          description={`Tracking requests and job posts for ${currentSeeker.name}.`}
          actions={
            <Button
              type="button"
              variant="inverse"
              className="rounded-[var(--radius-full)]"
              onClick={() => clearSeekerSession()}
            >
              Look up another phone
            </Button>
          }
        />
        <div className="flex flex-wrap gap-[var(--space-2)]">
          <Button
            type="button"
            variant={tab === "bookings" ? "primary" : "secondary"}
            className="h-8 min-h-8 rounded-[var(--radius-full)] px-3.5 text-[length:var(--text-sm)]"
            onClick={() => setTab("bookings")}
          >
            Bookings ({bookings.length})
          </Button>
          <Button
            type="button"
            variant={tab === "jobs" ? "primary" : "secondary"}
            className="h-8 min-h-8 rounded-[var(--radius-full)] px-3.5 text-[length:var(--text-sm)]"
            onClick={() => setTab("jobs")}
          >
            My job posts ({jobs.length})
          </Button>
        </div>
      </div>

      {tab === "bookings" ? (
        <SeekerRequestsList
          bookings={bookings}
          seekerName={currentSeeker.name}
        />
      ) : (
        <SeekerJobPosts jobs={jobs} />
      )}
    </Container>
  );
}
