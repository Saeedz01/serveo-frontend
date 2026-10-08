"use client";

import { useState } from "react";
import {
  Button,
  ConfirmDialog,
  EmptyState,
  PageHeader,
  Typography,
  ViewModeToggle,
  useToast,
  type ViewMode,
} from "@/components/ui";
import { usePrototype } from "@/components/prototype/prototype-provider";
import { serviceCategories } from "@/lib/services-catalog";
import { cx } from "@/lib/cx";
import { ManagedServiceCard } from "./managed-service-card";

export function MyServicesList() {
  const {
    ready,
    currentProvider,
    servicesForProvider,
    publishService,
    unpublishService,
    removeService,
  } = usePrototype();
  const { pushToast } = useToast();
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("grid");

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
  const pendingDelete = services.find((service) => service.id === pendingDeleteId);

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

  const handleConfirmDelete = () => {
    if (!pendingDelete) return;
    removeService(pendingDelete.id);
    pushToast({
      tone: "success",
      title: "Service deleted",
      description: `"${pendingDelete.title}" was removed.`,
    });
    setPendingDeleteId(null);
  };

  return (
    <div className="space-y-[var(--space-6)]">
      <PageHeader
        tone="primary"
        eyebrow="Provider workspace"
        title="My services"
        description={
          canPublish
            ? "Edit, publish, or remove offerings. Switch between grid and list views."
            : "Build drafts now. Publish becomes available after verification."
        }
        actions={
          canCreate ? (
            <Button
              as="a"
              href="/provider/services/new"
              variant="inverse"
              className="rounded-[var(--radius-full)]"
            >
              Create service
            </Button>
          ) : (
            <Button className="rounded-[var(--radius-full)]" disabled>
              Create service
            </Button>
          )
        }
      />

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
        <>
          <div className="flex items-center justify-between gap-[var(--space-3)]">
            <Typography variant="caption" className="text-muted">
              {services.length} service{services.length === 1 ? "" : "s"}
            </Typography>
            <ViewModeToggle value={viewMode} onChange={setViewMode} />
          </div>

          <div
            className={cx(
              viewMode === "grid"
                ? "grid gap-[var(--space-5)] sm:grid-cols-2 xl:grid-cols-3"
                : "flex flex-col gap-[var(--space-4)]",
            )}
          >
            {services.map((service) => (
              <ManagedServiceCard
                key={service.id}
                service={service}
                categoryLabel={categoryLabel(service.categoryId)}
                canPublish={canPublish}
                layout={viewMode}
                onPublish={() => handlePublish(service.id, service.title)}
                onUnpublish={() => handleUnpublish(service.id, service.title)}
                onDelete={() => setPendingDeleteId(service.id)}
              />
            ))}
          </div>
        </>
      )}

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        title="Delete this service?"
        description={
          pendingDelete
            ? `"${pendingDelete.title}" will be permanently removed from your workspace.`
            : "This service will be permanently removed."
        }
        confirmLabel="Delete service"
        tone="danger"
        onConfirm={handleConfirmDelete}
        onCancel={() => setPendingDeleteId(null)}
      />
    </div>
  );
}
