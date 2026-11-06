"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Button,
  EmptyState,
  Label,
  PageHeader,
  ProviderListSkeleton,
  Select,
  useToast,
} from "@/components/ui";
import { usePrototype } from "@/components/prototype/prototype-provider";
import { AvailabilityFields } from "@/app/provider/services/new/components/availability-fields";
import type { AvailabilitySlot } from "@/lib/prototype-types";
import { defaultAvailability } from "@/lib/prototype-availability";

export function AvailabilityPanel() {
  const {
    ready,
    currentProvider,
    servicesForProvider,
    updateServiceAvailability,
  } = usePrototype();
  const { pushToast } = useToast();
  const [serviceId, setServiceId] = useState("");
  const [slots, setSlots] = useState<AvailabilitySlot[]>(defaultAvailability());
  const [busy, setBusy] = useState(false);

  const services = currentProvider
    ? servicesForProvider(currentProvider.id)
    : [];

  const selected = useMemo(
    () => services.find((service) => service.id === serviceId) ?? null,
    [services, serviceId],
  );

  useEffect(() => {
    if (!services.length) {
      setServiceId("");
      return;
    }
    if (!services.some((service) => service.id === serviceId)) {
      setServiceId(services[0].id);
    }
  }, [services, serviceId]);

  useEffect(() => {
    if (!selected) {
      setSlots(defaultAvailability());
      return;
    }
    setSlots(selected.availability.map((slot) => ({ ...slot })));
  }, [selected]);

  if (ready && !currentProvider) {
    return (
      <EmptyState
        title="Sign in required"
        description="Log in as a provider to manage service availability."
        action={
          <Button as="a" href="/provider/login">
            Provider login
          </Button>
        }
      />
    );
  }

  const handleSave = () => {
    if (!serviceId) return;
    setBusy(true);
    updateServiceAvailability(serviceId, slots);
    setBusy(false);
    pushToast({
      tone: "success",
      title: "Availability saved",
      description: selected
        ? `Updated weekly hours for “${selected.title}”.`
        : "Weekly hours updated.",
    });
  };

  return (
    <div className="space-y-[var(--space-6)]">
      <PageHeader
        tone="primary"
        eyebrow="Schedule"
        title="Availability"
        description="Choose a service and set the days and hours seekers can request it."
      />

      {!ready ? (
        <ProviderListSkeleton rows={2} />
      ) : services.length === 0 ? (
        <EmptyState
          title="No services yet"
          description="Create a service first, then set weekly availability for it."
          action={
            <Button as="a" href="/provider/services/new">
              Create service
            </Button>
          }
        />
      ) : (
        <div className="space-y-[var(--space-5)] rounded-[var(--radius-xl)] border border-border bg-surface p-[var(--space-6)]">
          <div>
            <Label htmlFor="availability-service">Service</Label>
            <Select
              id="availability-service"
              value={serviceId}
              onChange={(event) => setServiceId(event.target.value)}
            >
              {services.map((service) => (
                <option key={service.id} value={service.id}>
                  {service.title} ({service.status})
                </option>
              ))}
            </Select>
          </div>

          <AvailabilityFields value={slots} onChange={setSlots} />

          <Button
            type="button"
            className="rounded-[var(--radius-full)]"
            disabled={busy || !serviceId}
            onClick={handleSave}
          >
            {busy ? "Saving..." : "Save availability"}
          </Button>
        </div>
      )}
    </div>
  );
}
