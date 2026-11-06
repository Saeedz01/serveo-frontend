"use client";

import { useMemo, useState } from "react";
import {
  Button,
  ConfirmDialog,
  Input,
  Label,
  PageHeader,
  ProviderListSkeleton,
  Typography,
  useToast,
} from "@/components/ui";
import { usePrototype } from "@/components/prototype/prototype-provider";
import {
  useCreateServiceCityMutation,
  useDeleteServiceCityMutation,
  useGetServiceCitiesQuery,
  useUpdateServiceCityMutation,
} from "@/service/api";
import { getApiErrorMessage } from "@/service/auth-session";

export function AdminCitiesPanel() {
  const { ready, adminAuthenticated } = usePrototype();
  const { pushToast } = useToast();
  const { data: cities = [], isLoading } = useGetServiceCitiesQuery(
    { includeInactive: true },
    { skip: !ready || !adminAuthenticated },
  );
  const [createCity, { isLoading: creating }] = useCreateServiceCityMutation();
  const [updateCity, { isLoading: updating }] = useUpdateServiceCityMutation();
  const [deleteCity, { isLoading: deleting }] = useDeleteServiceCityMutation();

  const [name, setName] = useState("");
  const [pendingRemoveId, setPendingRemoveId] = useState<string | null>(null);

  const pendingCity = useMemo(
    () => cities.find((city) => city.id === pendingRemoveId) ?? null,
    [cities, pendingRemoveId],
  );

  const busy = creating || updating || deleting;

  const handleCreate = async () => {
    const trimmed = name.trim();
    if (!trimmed) {
      pushToast({
        tone: "error",
        title: "City name required",
        description: "Enter a city name to add.",
      });
      return;
    }
    try {
      await createCity({ name: trimmed }).unwrap();
      setName("");
      pushToast({
        tone: "success",
        title: "City added",
        description: `${trimmed} is now available for providers and seekers.`,
      });
    } catch (error) {
      pushToast({
        tone: "error",
        title: "Could not add city",
        description: getApiErrorMessage(error, "Please try again."),
      });
    }
  };

  const handleToggleActive = async (id: string, isActive: boolean) => {
    try {
      await updateCity({ id, body: { isActive: !isActive } }).unwrap();
      pushToast({
        tone: "success",
        title: isActive ? "City deactivated" : "City activated",
        description: isActive
          ? "It will no longer appear in provider and seeker dropdowns."
          : "It is available again for new listings.",
      });
    } catch (error) {
      pushToast({
        tone: "error",
        title: "Could not update city",
        description: getApiErrorMessage(error, "Please try again."),
      });
    }
  };

  const handleRemove = async () => {
    if (!pendingRemoveId) return;
    try {
      await deleteCity(pendingRemoveId).unwrap();
      pushToast({
        tone: "success",
        title: "City removed",
        description: pendingCity
          ? `${pendingCity.name} was removed or deactivated if still in use.`
          : "City removed.",
      });
      setPendingRemoveId(null);
    } catch (error) {
      pushToast({
        tone: "error",
        title: "Could not remove city",
        description: getApiErrorMessage(error, "Please try again."),
      });
    }
  };

  if (!ready || isLoading) {
    return (
      <div className="space-y-[var(--space-6)]">
        <PageHeader
          tone="primary"
          eyebrow="Coverage"
          title="Service cities"
          description="Manage cities providers and seekers can choose from."
        />
        <ProviderListSkeleton rows={4} />
      </div>
    );
  }

  return (
    <div className="space-y-[var(--space-6)]">
      <PageHeader
        tone="primary"
        eyebrow="Coverage"
        title="Service cities"
        description={`${cities.length} cities configured. Add, deactivate, or remove marketplace coverage areas.`}
      />

      <div className="rounded-[var(--radius-xl)] border border-border bg-surface p-[var(--space-4)] sm:p-[var(--space-5)]">
        <div className="flex flex-col gap-[var(--space-3)] sm:flex-row sm:items-end">
          <div className="min-w-0 flex-1">
            <Label htmlFor="new-city-name">Add city</Label>
            <Input
              id="new-city-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="e.g. Sahiwal"
              disabled={busy}
            />
          </div>
          <Button type="button" disabled={busy} onClick={() => void handleCreate()}>
            {creating ? "Adding…" : "Add city"}
          </Button>
        </div>
      </div>

      <div className="overflow-hidden rounded-[var(--radius-xl)] border border-border bg-surface">
        <ul className="divide-y divide-border">
          {cities.map((city) => (
            <li
              key={city.id}
              className="flex flex-col gap-3 px-[var(--space-4)] py-[var(--space-4)] sm:flex-row sm:items-center sm:justify-between sm:px-[var(--space-5)]"
            >
              <div className="min-w-0">
                <Typography variant="h4" className="text-foreground">
                  {city.name}
                </Typography>
                <Typography variant="caption" className="text-muted">
                  {city.slug}
                  {city.isActive ? "" : " · inactive"}
                </Typography>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  disabled={busy}
                  onClick={() => void handleToggleActive(city.id, city.isActive)}
                >
                  {city.isActive ? "Deactivate" : "Activate"}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  disabled={busy}
                  onClick={() => setPendingRemoveId(city.id)}
                >
                  Remove
                </Button>
              </div>
            </li>
          ))}
        </ul>
        {cities.length === 0 ? (
          <div className="px-[var(--space-5)] py-[var(--space-7)] text-center">
            <Typography variant="body" className="text-muted">
              No cities yet. Add the first coverage city above.
            </Typography>
          </div>
        ) : null}
      </div>

      <ConfirmDialog
        open={Boolean(pendingRemoveId)}
        title="Remove city?"
        description={
          pendingCity
            ? `Remove ${pendingCity.name}? If services still use it, the city will be deactivated instead of deleted.`
            : "Remove this city?"
        }
        confirmLabel="Remove"
        onConfirm={() => void handleRemove()}
        onCancel={() => setPendingRemoveId(null)}
      />
    </div>
  );
}
