"use client";

import { useMemo } from "react";
import { Button, EmptyState, ProviderListSkeleton } from "@/components/ui";
import { usePrototype } from "@/components/prototype/prototype-provider";
import {
  useGetMyServicesQuery,
  useGetMyTokenBalanceQuery,
  useGetProviderBookingsQuery,
  useGetProviderReviewsQuery,
} from "@/service/api";
import { getAccessToken } from "@/service/splitApiSetting";
import { DashboardDrafts } from "./dashboard-drafts";
import { DashboardPending } from "./dashboard-pending";
import { DashboardVerified } from "./dashboard-verified";

function aggregateByService(reviews: Array<{ serviceId: string; rating: number }>) {
  const map = new Map<string, { total: number; count: number }>();
  for (const review of reviews) {
    const row = map.get(review.serviceId) ?? { total: 0, count: 0 };
    row.total += review.rating;
    row.count += 1;
    map.set(review.serviceId, row);
  }
  const result = new Map<string, { average: number; count: number }>();
  for (const [serviceId, row] of map) {
    result.set(serviceId, {
      average: Math.round((row.total / row.count) * 10) / 10,
      count: row.count,
    });
  }
  return result;
}

export function DashboardView() {
  const { ready, currentProvider } = usePrototype();
  const hasToken = Boolean(getAccessToken());
  const listSkip = !ready || !currentProvider || !hasToken;
  const { data: apiBookings = [] } = useGetProviderBookingsQuery(undefined, {
    skip: listSkip,
    refetchOnFocus: false,
  });
  const { data: tokenBalance } = useGetMyTokenBalanceQuery(undefined, {
    skip: listSkip,
    refetchOnFocus: false,
  });
  const { data: apiServices = [], isLoading: servicesLoading } =
    useGetMyServicesQuery(undefined, {
      skip: listSkip,
      refetchOnFocus: false,
    });
  const { data: providerReviews } = useGetProviderReviewsQuery(
    currentProvider?.id ?? "",
    {
      skip: !ready || !currentProvider?.id,
      refetchOnFocus: false,
    },
  );
  const ratingsByService = useMemo(
    () => aggregateByService(providerReviews?.reviews ?? []),
    [providerReviews?.reviews],
  );

  if (!ready || (currentProvider && hasToken && servicesLoading)) {
    return <ProviderListSkeleton rows={3} showHeader />;
  }

  if (!currentProvider || !hasToken) {
    // ProviderShell redirects expired/missing sessions to login.
    return <ProviderListSkeleton rows={3} showHeader />;
  }

  const services = apiServices.map((service) => {
    const rating = ratingsByService.get(service.id);
    return {
      ...service,
      ratingAverage: rating?.average ?? 0,
      ratingCount: rating?.count ?? 0,
    };
  });
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
        providerRatingAverage={providerReviews?.average ?? 0}
        providerRatingCount={providerReviews?.count ?? 0}
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
