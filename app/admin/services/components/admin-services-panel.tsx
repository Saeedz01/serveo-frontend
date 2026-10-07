"use client";

import { useMemo, useState } from "react";
import {
  Button,
  ConfirmDialog,
  Pill,
  ServiceStatusChip,
  Typography,
} from "@/components/ui";
import { usePrototype } from "@/components/prototype/prototype-provider";
import type { ProviderServiceStatus } from "@/lib/prototype-types";

const filters: Array<ProviderServiceStatus | "all"> = [
  "all",
  "published",
  "suspended",
  "draft",
];

export function AdminServicesPanel() {
  const {
    ready,
    state,
    suspendService,
    restoreService,
    removeService,
  } = usePrototype();
  const [filter, setFilter] = useState<(typeof filters)[number]>("all");
  const [pendingRemoveId, setPendingRemoveId] = useState<string | null>(null);

  const providerName = useMemo(() => {
    const map = new Map(state.providers.map((provider) => [provider.id, provider.name]));
    return (providerId: string) => map.get(providerId) ?? "Unknown provider";
  }, [state.providers]);

  const services = useMemo(
    () =>
      state.services.filter((service) =>
        filter === "all" ? true : service.status === filter,
      ),
    [filter, state.services],
  );

  if (!ready) {
    return <Typography variant="body">Loading services...</Typography>;
  }

  return (
    <div className="space-y-[var(--space-6)]">
      <div>
        <Typography variant="h1" className="mb-[var(--space-2)]">
          Marketplace services
        </Typography>
        <Typography variant="bodyLarge">
          Suspend, restore, or remove provider-published services.
        </Typography>
      </div>

      <div className="flex flex-wrap gap-[var(--space-2)]">
        {filters.map((value) => (
          <Pill
            key={value}
            type="button"
            active={filter === value}
            onClick={() => setFilter(value)}
          >
            {value === "all" ? "All" : value.charAt(0).toUpperCase() + value.slice(1)}
          </Pill>
        ))}
      </div>

      <div className="overflow-hidden rounded-[var(--radius-xl)] border border-border bg-surface">
        <ul className="divide-y divide-border">
          {services.map((service) => (
            <li
              key={service.id}
              className="flex flex-col gap-[var(--space-3)] px-[var(--space-5)] py-[var(--space-4)] lg:flex-row lg:items-center lg:justify-between"
            >
              <div className="min-w-0">
                <Typography variant="h4" className="mb-1 truncate">
                  {service.title}
                </Typography>
                <Typography variant="caption" className="block text-muted">
                  {providerName(service.providerId)} · {service.address}
                </Typography>
              </div>
              <div className="flex flex-wrap items-center gap-[var(--space-2)]">
                <ServiceStatusChip status={service.status} />
                {service.status === "published" ? (
                  <Button
                    type="button"
                    variant="secondary"
                    className="h-9 min-h-9 px-3 text-[length:var(--text-sm)]"
                    onClick={() => suspendService(service.id)}
                  >
                    Suspend
                  </Button>
                ) : null}
                {service.status === "suspended" ? (
                  <Button
                    type="button"
                    className="h-9 min-h-9 px-3 text-[length:var(--text-sm)]"
                    onClick={() => restoreService(service.id)}
                  >
                    Restore
                  </Button>
                ) : null}
                <Button
                  type="button"
                  variant="ghost"
                  className="h-9 min-h-9 px-3 text-[length:var(--text-sm)] text-error"
                  onClick={() => setPendingRemoveId(service.id)}
                >
                  Remove
                </Button>
              </div>
            </li>
          ))}
          {services.length === 0 ? (
            <li className="px-[var(--space-5)] py-[var(--space-6)]">
              <Typography variant="body" className="text-muted">
                No services match this filter.
              </Typography>
            </li>
          ) : null}
        </ul>
      </div>

      <ConfirmDialog
        open={Boolean(pendingRemoveId)}
        title="Remove this service?"
        description="This permanently removes the service from the prototype marketplace list. This action cannot be undone in the demo store."
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
