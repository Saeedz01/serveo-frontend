"use client";

import {
  Button,
  EmptyState,
  ServiceStatusChip,
  Typography,
  useToast,
} from "@/components/ui";
import { usePrototype } from "@/components/prototype/prototype-provider";
import { formatServicePrice } from "@/lib/prototype-types";
import { serviceCategories } from "@/lib/services-catalog";

export function MyServicesList() {
  const {
    ready,
    currentProvider,
    servicesForProvider,
    publishService,
    unpublishService,
  } = usePrototype();
  const { pushToast } = useToast();

  if (!ready) {
    return <Typography variant="body">Loading services...</Typography>;
  }

  if (!currentProvider) {
    return (
      <EmptyState
        title="Sign in as a provider"
        description="Log in to manage your services, or create a new account."
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
  const canPublish = currentProvider.status === "verified";
  const canCreate = currentProvider.status !== "rejected";
  const categoryLabel = (categoryId: string) =>
    serviceCategories.find((category) => category.id === categoryId)?.label ??
    categoryId;

  const handlePublish = (serviceId: string, title: string) => {
    publishService(serviceId);
    pushToast({
      tone: "success",
      title: "Service published",
      description: `"${title}" is now visible to seekers.`,
    });
  };

  const handleUnpublish = (serviceId: string, title: string) => {
    unpublishService(serviceId);
    pushToast({
      tone: "info",
      title: "Moved to draft",
      description: `"${title}" is private and hidden from the marketplace.`,
    });
  };

  return (
    <div className="space-y-[var(--space-6)]">
      <div className="flex flex-col gap-[var(--space-3)] rounded-[var(--radius-xl)] border border-border bg-surface/90 p-[var(--space-6)] shadow-[0_18px_40px_-34px_rgba(109,40,217,0.5)] sm:flex-row sm:items-end sm:justify-between">
        <div>
          <Typography variant="h1" className="mb-[var(--space-2)]">
            My services
          </Typography>
          <Typography variant="bodyLarge">
            {canPublish
              ? "Publish offerings, or move them back to draft to keep them private."
              : "Build drafts now. Publish becomes available after verification."}
          </Typography>
        </div>
        {canCreate ? (
          <Button
            as="a"
            href="/provider/services/new"
            className="rounded-[var(--radius-full)]"
          >
            Create service
          </Button>
        ) : (
          <Button className="rounded-[var(--radius-full)]" disabled>
            Create service
          </Button>
        )}
      </div>

      {services.length === 0 ? (
        <EmptyState
          title="No services yet"
          description={
            canCreate
              ? "Create your first service with location, availability, and coverage radius."
              : "Your account can’t create services while rejected."
          }
          action={
            canCreate ? (
              <Button as="a" href="/provider/services/new">
                Create service
              </Button>
            ) : (
              <Button as="a" href="/provider/dashboard" variant="secondary">
                Back to dashboard
              </Button>
            )
          }
        />
      ) : (
        <div className="overflow-hidden rounded-[var(--radius-xl)] border border-border bg-surface">
          <ul className="divide-y divide-border">
            {services.map((service) => (
              <li
                key={service.id}
                className="flex flex-col gap-[var(--space-3)] px-[var(--space-5)] py-[var(--space-4)] transition-colors hover:bg-secondary/40 lg:flex-row lg:items-center lg:justify-between"
              >
                <div className="min-w-0">
                  <Typography variant="h4" className="mb-1 truncate">
                    {service.title}
                  </Typography>
                  <Typography variant="caption" className="block text-muted">
                    {categoryLabel(service.categoryId)} ·{" "}
                    {formatServicePrice(service.priceAmount, service.priceUnit)}{" "}
                    · {service.address} · {service.radiusKm} km radius
                  </Typography>
                </div>
                <div className="flex flex-wrap items-center gap-[var(--space-3)]">
                  <ServiceStatusChip status={service.status} />
                  {service.status === "draft" && canPublish ? (
                    <Button
                      type="button"
                      className="h-9 min-h-9 px-4 text-[length:var(--text-sm)]"
                      onClick={() => handlePublish(service.id, service.title)}
                    >
                      Publish
                    </Button>
                  ) : null}
                  {service.status === "draft" && !canPublish ? (
                    <Typography variant="caption" className="text-warning">
                      Awaiting verification to publish
                    </Typography>
                  ) : null}
                  {service.status === "published" ? (
                    <Button
                      type="button"
                      variant="secondary"
                      className="h-9 min-h-9 px-4 text-[length:var(--text-sm)]"
                      onClick={() => handleUnpublish(service.id, service.title)}
                    >
                      Move to draft
                    </Button>
                  ) : null}
                  {service.status === "suspended" ? (
                    <Typography variant="caption" className="text-error">
                      Suspended by admin — not visible to seekers
                    </Typography>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
