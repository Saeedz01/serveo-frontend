"use client";

import { Button, EmptyState, ProviderListSkeleton } from "@/components/ui";
import { usePrototype } from "@/components/prototype/prototype-provider";
import {
  useGetMyTokenBalanceQuery,
  useGetProviderBookingsQuery,
} from "@/service/api";
import { getAccessToken } from "@/service/splitApiSetting";
import { DashboardDrafts } from "./dashboard-drafts";
import { DashboardPending } from "./dashboard-pending";
import { DashboardVerified } from "./dashboard-verified";

export function DashboardView() {
  const { ready, currentProvider, servicesForProvider } = usePrototype();
  const hasToken = Boolean(getAccessToken());
  const { data: apiBookings = [] } = useGetProviderBookingsQuery(undefined, {
    skip: !ready || !currentProvider || !hasToken,
    refetchOnFocus: false,
  });
  const { data: tokenBalance } = useGetMyTokenBalanceQuery(undefined, {
    skip: !ready || !currentProvider || !hasToken,
    refetchOnFocus: false,
  });

  if (!ready) {
    return <ProviderListSkeleton rows={3} showHeader />;
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
  const pendingBookings = apiBookings.filter(
    (booking) =>
      booking.status === "pending" || booking.status === "negotiating",
  ).length;

  if (currentProvider.status === "verified") {
    return (
      <DashboardVerified
        name={currentProvider.name}
        services={services}
        pendingBookings={pendingBookings}
        monthlyTokens={tokenBalance?.monthlyGrant}
        remainingTokens={tokenBalance?.balance}
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
