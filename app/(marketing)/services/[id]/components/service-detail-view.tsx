"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo } from "react";
import { ArrowLeft, Star } from "lucide-react";
import { Button, Container, RatingSummary, Typography } from "@/components/ui";
import { usePrototype } from "@/components/prototype/prototype-provider";
import { findMarketplaceItem } from "@/lib/marketplace";
import { serviceCategories } from "@/lib/services-catalog";
import { useGetProviderReviewsQuery, useGetServiceReviewsQuery } from "@/service/api";
import { ServiceProviderCoverage } from "./service-provider-coverage";
import { ServiceRequestForm } from "./service-request-form";
import { ServiceReviewsSection } from "./service-reviews-section";

function providerInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return `${parts[0]![0] ?? ""}${parts[1]![0] ?? ""}`.toUpperCase();
}

export function ServiceDetailView({ serviceId }: { serviceId: string }) {
  const { ready, state } = usePrototype();
  const {
    data: serviceReviews,
    isFetching: serviceReviewsLoading,
  } = useGetServiceReviewsQuery(serviceId, { skip: !serviceId });

  const service = useMemo(() => {
    const published = state.services.filter(
      (item) => item.status === "published",
    );
    return findMarketplaceItem(
      serviceId,
      published,
      (providerId) =>
        state.providers.find((provider) => provider.id === providerId)?.name,
    );
  }, [serviceId, state.providers, state.services]);

  const coverage = useMemo(
    () =>
      state.services.find(
        (item) => item.id === serviceId && item.status === "published",
      ),
    [serviceId, state.services],
  );

  const providerId = service?.providerId;
  const { data: providerReviews } = useGetProviderReviewsQuery(providerId ?? "", {
    skip: !providerId,
  });

  const serviceRating = {
    average: serviceReviews?.average ?? 0,
    count: serviceReviews?.count ?? 0,
  };
  const reviews = serviceReviews?.reviews ?? [];
  const providerRating = {
    average: providerReviews?.average ?? 0,
    count: providerReviews?.count ?? 0,
  };

  const categoryLabel =
    serviceCategories.find((category) => category.id === service?.categoryId)
      ?.label ?? "Service";

  if (!ready) {
    return (
      <Container className="py-[var(--space-8)]">
        <Typography variant="body">Loading service details...</Typography>
      </Container>
    );
  }

  if (!service) {
    return (
      <Container className="py-[var(--space-8)]">
        <Typography variant="h2" className="mb-[var(--space-3)]">
          Service not found
        </Typography>
        <Button as="a" href="/services" variant="secondary">
          Back to services
        </Button>
      </Container>
    );
  }

  const providerName = service.providerName?.trim() || "Provider";

  return (
    <div className="bg-background">
      <Container className="py-[var(--space-6)] lg:py-[var(--space-8)]">
        <Link
          href="/services"
          className="mb-[var(--space-5)] inline-flex items-center gap-2 text-[length:var(--text-sm)] font-medium text-muted transition-colors hover:text-primary"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />
          Back to services
        </Link>

        <div className="grid gap-[var(--space-6)] lg:grid-cols-[minmax(0,1.35fr)_minmax(18rem,0.75fr)] lg:items-start">
          <div className="space-y-[var(--space-6)]">
            <div className="overflow-hidden rounded-[var(--radius-xl)] border border-border/80 bg-surface shadow-[0_18px_50px_-36px_rgba(10,10,10,0.35)]">
              <div className="relative aspect-[16/10] bg-secondary">
                <Image
                  src={service.imageSrc}
                  alt={service.imageAlt}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 60vw"
                  priority
                />
              </div>

              <div className="space-y-[var(--space-4)] px-[var(--space-5)] py-[var(--space-5)] sm:px-[var(--space-6)] sm:py-[var(--space-6)]">
                <div>
                  <Typography
                    variant="caption"
                    className="mb-2 inline-flex rounded-[var(--radius-full)] bg-primary-soft px-2.5 py-1 font-semibold tracking-wide text-primary uppercase"
                  >
                    {categoryLabel}
                  </Typography>
                  <Typography variant="h1" className="mb-2 tracking-tight">
                    {service.title}
                  </Typography>
                  <Typography variant="h3" className="text-primary">
                    {service.priceLabel}
                  </Typography>
                </div>

                <div className="rounded-[var(--radius-lg)] border border-border/80 bg-secondary/35 px-[var(--space-4)] py-[var(--space-3)]">
                  <Typography
                    variant="caption"
                    className="mb-1.5 block font-semibold tracking-wide text-muted uppercase"
                  >
                    This service
                  </Typography>
                  {serviceRating.count > 0 ? (
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                      <RatingSummary
                        average={serviceRating.average}
                        count={serviceRating.count}
                        size="md"
                      />
                      <Typography variant="caption" className="text-muted">
                        Based only on reviews for this listing
                      </Typography>
                    </div>
                  ) : (
                    <Typography variant="caption" className="text-muted">
                      No reviews for this listing yet
                    </Typography>
                  )}
                </div>

                <Typography
                  variant="bodyLarge"
                  className="max-w-prose leading-relaxed text-foreground/85"
                >
                  {service.description}
                </Typography>
              </div>
            </div>

            <section className="rounded-[var(--radius-xl)] border border-border/80 bg-surface p-[var(--space-5)] shadow-[0_12px_40px_-30px_rgba(10,10,10,0.28)] sm:p-[var(--space-6)]">
              <div className="mb-[var(--space-4)] flex flex-wrap items-start gap-[var(--space-4)]">
                <span
                  className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-[var(--radius-full)] bg-primary-soft text-[length:var(--text-sm)] font-semibold tracking-wide text-primary"
                  aria-hidden
                >
                  {providerInitials(providerName)}
                </span>
                <div className="min-w-0 flex-1 space-y-1">
                  <Typography
                    variant="caption"
                    className="block font-semibold tracking-wide text-muted uppercase"
                  >
                    Provider
                  </Typography>
                  <Typography variant="h4">{providerName}</Typography>
                  <Typography variant="caption" className="block text-muted">
                    Overall score across all of this provider’s services
                  </Typography>
                </div>
              </div>

              <div className="rounded-[var(--radius-lg)] border border-border/70 bg-secondary/30 px-[var(--space-4)] py-[var(--space-3)]">
                {providerRating.count > 0 ? (
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <Star className="h-4 w-4 fill-primary text-primary" aria-hidden />
                      <Typography variant="label">
                        Overall provider rating
                      </Typography>
                    </div>
                    <RatingSummary
                      average={providerRating.average}
                      count={providerRating.count}
                      size="sm"
                    />
                  </div>
                ) : (
                  <Typography variant="caption" className="text-muted">
                    This provider doesn’t have reviews on other services yet.
                  </Typography>
                )}
              </div>
            </section>

            {coverage ? (
              <ServiceProviderCoverage
                service={coverage}
                providerName={service.providerName}
              />
            ) : null}

            <ServiceReviewsSection
              rating={serviceRating}
              reviews={reviews}
              loading={serviceReviewsLoading && !serviceReviews}
            />
          </div>

          <div className="lg:sticky lg:top-20 lg:self-start">
            <ServiceRequestForm service={service} coverage={coverage} />
          </div>
        </div>
      </Container>
    </div>
  );
}
