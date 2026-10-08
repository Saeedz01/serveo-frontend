"use client";

import { useMemo, useState } from "react";
import {
  ConfirmDialog,
  PageHeader,
  Pill,
  SearchField,
  Typography,
  ViewModeToggle,
  type ViewMode,
} from "@/components/ui";
import { usePrototype } from "@/components/prototype/prototype-provider";
import type { ProviderServiceStatus } from "@/lib/prototype-types";
import { cx } from "@/lib/cx";
import { AdminServiceCard } from "./admin-service-card";

const filters: Array<ProviderServiceStatus | "all"> = [
  "all",
  "published",
  "suspended",
  "draft",
];

export function AdminServicesPanel() {
  const { ready, state, suspendService, restoreService, removeService } =
    usePrototype();
  const [filter, setFilter] = useState<(typeof filters)[number]>("all");
  const [query, setQuery] = useState("");
  const [pendingRemoveId, setPendingRemoveId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("grid");

  const providerName = useMemo(() => {
    const map = new Map(
      state.providers.map((provider) => [provider.id, provider.name]),
    );
    return (providerId: string) => map.get(providerId) ?? "Unknown provider";
  }, [state.providers]);

  const services = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return state.services.filter((service) => {
      const matchesFilter =
        filter === "all" ? true : service.status === filter;
      if (!matchesFilter) return false;
      if (!normalized) return true;
      const haystack = [
        service.title,
        service.description,
        service.address,
        providerName(service.providerId),
        service.status,
        service.categoryId,
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(normalized);
    });
  }, [filter, providerName, query, state.services]);

  if (!ready) {
    return <Typography variant="body">Loading services...</Typography>;
  }

  return (
    <div className="space-y-[var(--space-6)]">
      <PageHeader
        tone="primary"
        eyebrow="Moderation"
        title="Marketplace services"
        description={`${state.services.length} listings in the marketplace. Search, filter, then suspend, restore, or remove.`}
      />

      <SearchField
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Search by title, provider, address, or category..."
        aria-label="Search services"
      />

      <div className="flex flex-col gap-[var(--space-3)] sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-[var(--space-2)]">
          {filters.map((value) => (
            <Pill
              key={value}
              type="button"
              active={filter === value}
              onClick={() => setFilter(value)}
            >
              {value === "all"
                ? "All"
                : value.charAt(0).toUpperCase() + value.slice(1)}
            </Pill>
          ))}
        </div>
        <ViewModeToggle value={viewMode} onChange={setViewMode} />
      </div>

      {services.length === 0 ? (
        <div className="rounded-[var(--radius-xl)] border border-border bg-surface px-[var(--space-5)] py-[var(--space-6)]">
          <Typography variant="body" className="text-muted">
            No services match this search or filter.
          </Typography>
        </div>
      ) : (
        <div
          className={cx(
            viewMode === "grid"
              ? "grid gap-[var(--space-5)] sm:grid-cols-2 xl:grid-cols-3"
              : "flex flex-col gap-[var(--space-4)]",
          )}
        >
          {services.map((service) => (
            <AdminServiceCard
              key={service.id}
              service={service}
              providerLabel={providerName(service.providerId)}
              layout={viewMode}
              onSuspend={() => suspendService(service.id)}
              onRestore={() => restoreService(service.id)}
              onRemove={() => setPendingRemoveId(service.id)}
            />
          ))}
        </div>
      )}

      <ConfirmDialog
        open={Boolean(pendingRemoveId)}
        title="Remove this service?"
        description="This permanently removes the service from the marketplace list."
        confirmLabel="Remove service"
        tone="danger"
        onCancel={() => setPendingRemoveId(null)}
        onConfirm={() => {
          if (pendingRemoveId) removeService(pendingRemoveId);
          setPendingRemoveId(null);
        }}
      />
    </div>
  );
}
