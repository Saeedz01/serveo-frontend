"use client";

import { useMemo, useState } from "react";
import {
  Button,
  ConfirmDialog,
  EmptyState,
  PageHeader,
  ProviderListSkeleton,
  Typography,
  ViewModeToggle,
  useToast,
  type ViewMode,
} from "@/components/ui";
import { usePrototype } from "@/components/prototype/prototype-provider";
import { serviceCategories } from "@/lib/services-catalog";
import { cx } from "@/lib/cx";
import {
  useDeleteServiceMutation,
  useGetMyServicesQuery,
  useGetProviderReviewsQuery,
  useUpdateServiceMutation,
} from "@/service/api";
import { getApiErrorMessage } from "@/service/auth-session";
import { ManagedServiceCard } from "./managed-service-card";

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

export function MyServicesList() {
  const { ready, currentProvider } = usePrototype();
  const { data: services = [], isLoading, isError, refetch } =
    useGetMyServicesQuery(undefined, {
      skip: !ready || !currentProvider,
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
  const [updateService] = useUpdateServiceMutation();
  const [deleteService] = useDeleteServiceMutation();
  const { pushToast } = useToast();
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("grid");

  if (ready && !currentProvider) {
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

  const listLoading = !ready || Boolean(currentProvider && isLoading);
  const canPublish = currentProvider?.status === "verified";
  const canCreate = currentProvider ? currentProvider.status !== "rejected" : false;
  const pendingDelete = services.find((service) => service.id === pendingDeleteId);

  const categoryLabel = (categoryId: string) =>
    serviceCategories.find((category) => category.id === categoryId)?.label ??
    categoryId;

  const handlePublish = async (serviceId: string, title: string) => {
    try {
      await updateService({
        id: serviceId,
        body: { status: "published" },
      }).unwrap();
      pushToast({
        tone: "success",
        title: "Service published",
        description: `"${title}" is now visible to seekers.`,
      });
    } catch (error) {
      pushToast({
        tone: "error",
        title: "Publish failed",
        description: getApiErrorMessage(error, "Please try again."),
      });
    }
  };

  const handleUnpublish = async (serviceId: string, title: string) => {
    try {
      await updateService({
        id: serviceId,
        body: { status: "draft" },
      }).unwrap();
      pushToast({
        tone: "info",
        title: "Moved to draft",
        description: `"${title}" is private and hidden from the marketplace.`,
      });
    } catch (error) {
      pushToast({
        tone: "error",
        title: "Update failed",
        description: getApiErrorMessage(error, "Please try again."),
      });
    }
  };

  const handleConfirmDelete = async () => {
    if (!pendingDelete) return;
    try {
      await deleteService(pendingDelete.id).unwrap();
      pushToast({
        tone: "success",
        title: "Service deleted",
        description: `"${pendingDelete.title}" was removed.`,
      });
      setPendingDeleteId(null);
    } catch (error) {
      pushToast({
        tone: "error",
        title: "Delete failed",
        description: getApiErrorMessage(error, "Please try again."),
      });
    }
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

      {listLoading ? (
        <ProviderListSkeleton rows={3} />
      ) : isError ? (
        <EmptyState
          title="Could not load services"
          description="Check that you are logged in and the backend is running."
          action={
            <Button type="button" onClick={() => void refetch()}>
              Retry
            </Button>
          }
        />
      ) : services.length === 0 ? (
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
            {services.map((service) => {
              const rating = ratingsByService.get(service.id);
              return (
                <ManagedServiceCard
                  key={service.id}
                  service={service}
                  categoryLabel={categoryLabel(service.categoryId)}
                  canPublish={canPublish}
                  layout={viewMode}
                  ratingAverage={rating?.average ?? 0}
                  ratingCount={rating?.count ?? 0}
                  onPublish={() => void handlePublish(service.id, service.title)}
                  onUnpublish={() =>
                    void handleUnpublish(service.id, service.title)
                  }
                  onDelete={() => setPendingDeleteId(service.id)}
                />
              );
            })}
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
        onConfirm={() => void handleConfirmDelete()}
        onCancel={() => setPendingDeleteId(null)}
      />
    </div>
  );
}
