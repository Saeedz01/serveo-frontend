"use client";

import { Button, EmptyState, Typography } from "@/components/ui";
import { usePrototype } from "@/components/prototype/prototype-provider";
import { DashboardDrafts } from "./dashboard-drafts";
import { DashboardPending } from "./dashboard-pending";
import { DashboardVerified } from "./dashboard-verified";

export function DashboardView() {
  const { ready, currentProvider, servicesForProvider, bookingsForProvider } =
    usePrototype();

  if (!ready) {
    return <Typography variant="body">Loading provider workspace...</Typography>;
  }

  if (!currentProvider) {
    return (
        <EmptyState
          title="No provider session"
          description="Log in with your registered phone number, or create a new provider account."
          action={
            <div className="flex flex-wrap justify-center gap-3">
              <Button as="a" href="/provider/login">
                Provider login
              </Button>
              <Button as="a" href="/provider/signup" variant="secondary">
                Sign up
              </Button>
            </div>
          }
        />
    );
  }

  const services = servicesForProvider(currentProvider.id);
  const pendingBookings = bookingsForProvider(currentProvider.id).filter(
    (booking) =>
      booking.status === "pending" || booking.status === "negotiating",
  ).length;

  if (currentProvider.status === "verified") {
    return (
      <DashboardVerified
        name={currentProvider.name}
        services={services}
        pendingBookings={pendingBookings}
      />
    );
  }

  if (currentProvider.status === "rejected") {
    return (
      <EmptyState
        title="Identity rejected"
        description="Your ID review was not approved. Contact support or re-submit after updating your documents."
        action={
          <Button as="a" href="/provider/signup" variant="secondary">
            Start over
          </Button>
        }
      />
    );
  }

  return (
    <div className="space-y-[var(--space-6)]">
      <DashboardPending name={currentProvider.name} />
      <DashboardDrafts services={services} />
    </div>
  );
}
