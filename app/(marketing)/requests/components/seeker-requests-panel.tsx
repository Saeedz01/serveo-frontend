"use client";

import { useState } from "react";
import {
  Button,
  Container,
  PageHeader,
  Typography,
} from "@/components/ui";
import { usePrototype } from "@/components/prototype/prototype-provider";
import { SeekerRequestLookup } from "./seeker-request-lookup";
import { SeekerRequestsList } from "./seeker-requests-list";

export function SeekerRequestsPanel() {
  const {
    ready,
    currentSeeker,
    bookingsForCurrentSeeker,
    clearSeekerSession,
  } = usePrototype();
  const [, setTick] = useState(0);

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
            description="Check whether your service requests were accepted, declined, or are still pending."
          />
        </div>
        <SeekerRequestLookup onFound={() => setTick((value) => value + 1)} />
      </Container>
    );
  }

  const bookings = bookingsForCurrentSeeker();

  return (
    <Container className="py-[var(--space-6)] lg:py-[var(--space-8)]">
      <div className="mb-[var(--space-6)] space-y-[var(--space-4)]">
        <PageHeader
          tone="primary"
          eyebrow="Seeker"
          title="My requests"
          description={`Tracking requests for ${currentSeeker.name}. Status updates when the provider responds.`}
          actions={
            <Button
              type="button"
              variant="inverse"
              className="rounded-[var(--radius-full)]"
              onClick={() => clearSeekerSession()}
            >
              Switch account
            </Button>
          }
        />
      </div>

      <SeekerRequestsList
        bookings={bookings}
        seekerName={currentSeeker.name}
      />
    </Container>
  );
}
