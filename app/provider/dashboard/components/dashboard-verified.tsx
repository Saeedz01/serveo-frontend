import Link from "next/link";
import { ArrowRight, CalendarCheck2, Coins } from "lucide-react";
import {
  Button,
  PageHeader,
  RatingSummary,
  ServiceStatusChip,
  Typography,
} from "@/components/ui";
import type { ServiceDto } from "@/service/api";

type DashboardService = ServiceDto & {
  ratingAverage?: number;
  ratingCount?: number;
};

type DashboardVerifiedProps = {
  name: string;
  services: DashboardService[];
  pendingBookings: number;
  monthlyTokens?: number;
  remainingTokens?: number;
  providerRatingAverage?: number;
  providerRatingCount?: number;
};

export function DashboardVerified({
  name,
  services,
  pendingBookings,
  monthlyTokens,
  remainingTokens,
  providerRatingAverage = 0,
  providerRatingCount = 0,
}: DashboardVerifiedProps) {
  const published = services.filter((service) => service.status === "published").length;
  const drafts = services.filter((service) => service.status === "draft").length;
  const suspended = services.filter((service) => service.status === "suspended").length;
  const tokensLoaded =
    typeof monthlyTokens === "number" && typeof remainingTokens === "number";

  return (
    <div className="space-y-[var(--space-6)]">
      <PageHeader
        tone="primary"
        eyebrow="Verified provider"
        title={`Welcome back, ${name}`}
        description="Your marketplace is live. Review requests, tune availability, and keep strong services published."
        actions={
          <>
            {pendingBookings > 0 ? (
              <Button
                as="a"
                href="/provider/bookings"
                variant="inverse"
                className="rounded-[var(--radius-full)]"
              >
                <CalendarCheck2 className="h-4 w-4" aria-hidden />
                {pendingBookings} pending
              </Button>
            ) : null}
            <Button
              as="a"
              href="/provider/services/new"
              variant="onPrimary"
              className="rounded-[var(--radius-full)]"
            >
              Create service
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Button>
          </>
        }
      />

      {tokensLoaded ? (
        <div className="rounded-[var(--radius-xl)] border border-border bg-surface p-[var(--space-5)]">
          <div className="mb-[var(--space-4)] flex items-center gap-[var(--space-2)]">
            <Coins className="h-4 w-4 text-primary" aria-hidden />
            <Typography variant="label">Contact unlock tokens</Typography>
          </div>
          <div className="grid gap-[var(--space-4)] sm:grid-cols-2">
            <div>
              <Typography
                variant="caption"
                className="mb-[var(--space-2)] block text-muted"
              >
                Monthly total
              </Typography>
              <span className="inline-flex min-h-10 items-center rounded-[var(--radius-lg)] bg-primary-soft px-3 text-[length:var(--text-2xl)] font-semibold text-primary">
                {monthlyTokens}
              </span>
            </div>
            <div>
              <Typography
                variant="caption"
                className="mb-[var(--space-2)] block text-muted"
              >
                Remaining
              </Typography>
              <span className="inline-flex min-h-10 items-center rounded-[var(--radius-lg)] bg-emerald-50 px-3 text-[length:var(--text-2xl)] font-semibold text-success">
                {remainingTokens}
              </span>
            </div>
          </div>
        </div>
      ) : null}

      <div className="grid gap-[var(--space-4)] sm:grid-cols-2 xl:grid-cols-5">
        {[
          { label: "Total services", value: services.length, tone: "bg-primary-soft text-primary" },
          { label: "Published", value: published, tone: "bg-emerald-50 text-success" },
          { label: "Drafts", value: drafts, tone: "bg-amber-50 text-warning" },
          { label: "Suspended", value: suspended, tone: "bg-red-50 text-error" },
          {
            label: "Reviews",
            value: providerRatingCount,
            tone: "bg-primary-soft text-primary",
            rating: true as const,
          },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-[var(--radius-xl)] border border-border bg-surface p-[var(--space-5)] transition-transform hover:-translate-y-0.5 hover:shadow-[0_16px_36px_-28px_rgba(10,10,10,0.3)]"
          >
            <Typography variant="caption" className="mb-[var(--space-3)] block text-muted">
              {stat.label}
            </Typography>
            {"rating" in stat && stat.rating ? (
              <RatingSummary
                average={providerRatingAverage}
                count={providerRatingCount}
                size="sm"
                emptyLabel="No reviews yet"
              />
            ) : (
              <span
                className={`inline-flex min-h-10 min-w-10 items-center justify-center rounded-[var(--radius-lg)] px-3 text-[length:var(--text-2xl)] font-semibold ${stat.tone}`}
              >
                {stat.value}
              </span>
            )}
          </div>
        ))}
      </div>

      <div className="overflow-hidden rounded-[var(--radius-xl)] border border-border bg-surface">
        <div className="flex items-center justify-between border-b border-border px-[var(--space-5)] py-[var(--space-4)]">
          <Typography variant="h3">Recent services</Typography>
          <Link
            href="/provider/services"
            className="text-[length:var(--text-sm)] font-medium text-primary hover:underline"
          >
            View all
          </Link>
        </div>
        <ul className="divide-y divide-border">
          {services.slice(0, 5).map((service) => (
            <li
              key={service.id}
              className="flex flex-col gap-[var(--space-2)] px-[var(--space-5)] py-[var(--space-4)] transition-colors hover:bg-secondary/50 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0">
                <Typography variant="label" className="block">
                  {service.title}
                </Typography>
                <Typography variant="caption" className="text-muted">
                  {service.address}
                </Typography>
                <div className="mt-2">
                  <RatingSummary
                    average={service.ratingAverage ?? 0}
                    count={service.ratingCount ?? 0}
                    size="sm"
                    emptyLabel="No reviews yet"
                  />
                </div>
              </div>
              <ServiceStatusChip status={service.status} />
            </li>
          ))}
          {services.length === 0 ? (
            <li className="px-[var(--space-5)] py-[var(--space-6)]">
              <Typography variant="body" className="text-muted">
                No services yet. Create your first offering to get bookings.
              </Typography>
            </li>
          ) : null}
        </ul>
      </div>
    </div>
  );
}
