"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo } from "react";
import { ArrowLeft, MapPin } from "lucide-react";
import { Button, Container, Typography } from "@/components/ui";
import { usePrototype } from "@/components/prototype/prototype-provider";
import { findMarketplaceItem } from "@/lib/marketplace";
import { serviceCategories } from "@/lib/services-catalog";
import { ServiceRequestForm } from "./service-request-form";

export function ServiceDetailView({ serviceId }: { serviceId: string }) {
  const { ready, state } = usePrototype();

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

  return (
    <div className="bg-background">
      <Container className="py-[var(--space-6)] lg:py-[var(--space-8)]">
        <Link
          href="/services"
          className="mb-[var(--space-5)] inline-flex items-center gap-2 text-[length:var(--text-sm)] font-medium text-primary hover:underline"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />
          Back to services
        </Link>

        <div className="grid gap-[var(--space-6)] lg:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-[var(--space-5)]">
            <div className="relative aspect-[16/10] overflow-hidden rounded-[var(--radius-xl)] border border-border bg-secondary">
              <Image
                src={service.imageSrc}
                alt={service.imageAlt}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 60vw"
                priority
              />
            </div>

            <div>
              <Typography
                variant="caption"
                className="mb-2 inline-flex font-semibold tracking-wide text-primary uppercase"
              >
                {categoryLabel}
              </Typography>
              <Typography variant="h1" className="mb-[var(--space-3)]">
                {service.title}
              </Typography>
              <Typography variant="h3" className="mb-[var(--space-4)] text-primary">
                {service.priceLabel}
              </Typography>
              <Typography variant="bodyLarge" className="mb-[var(--space-4)]">
                {service.description}
              </Typography>
              {service.address ? (
                <Typography
                  variant="body"
                  className="inline-flex items-center gap-2 text-muted"
                >
                  <MapPin className="h-4 w-4 text-primary" aria-hidden />
                  {service.address}
                </Typography>
              ) : null}
              {service.providerName ? (
                <Typography variant="caption" className="mt-2 block text-muted">
                  Provided by {service.providerName}
                </Typography>
              ) : null}
            </div>
          </div>

          <div className="lg:sticky lg:top-20 lg:self-start">
            <ServiceRequestForm service={service} />
          </div>
        </div>
      </Container>
    </div>
  );
}
