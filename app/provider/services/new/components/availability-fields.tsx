"use client";

import { Input, Label, Typography } from "@/components/ui";
import type { AvailabilitySlot } from "@/lib/prototype-types";

type AvailabilityFieldsProps = {
  value: AvailabilitySlot[];
  onChange: (value: AvailabilitySlot[]) => void;
};

export function AvailabilityFields({ value, onChange }: AvailabilityFieldsProps) {
  const updateSlot = (
    index: number,
    patch: Partial<AvailabilitySlot>,
  ) => {
    onChange(
      value.map((slot, slotIndex) =>
        slotIndex === index ? { ...slot, ...patch } : slot,
      ),
    );
  };

  return (
    <div className="space-y-[var(--space-3)]">
      <Label>Availability</Label>
      <div className="space-y-[var(--space-2)] rounded-[var(--radius-lg)] border border-border p-[var(--space-4)]">
        {value.map((slot, index) => (
          <div
            key={slot.day}
            className="grid grid-cols-[72px_1fr_1fr_auto] items-center gap-[var(--space-3)]"
          >
            <Typography variant="label">{slot.day}</Typography>
            <Input
              type="time"
              value={slot.start}
              disabled={!slot.enabled}
              onChange={(event) => updateSlot(index, { start: event.target.value })}
              aria-label={`${slot.day} start`}
            />
            <Input
              type="time"
              value={slot.end}
              disabled={!slot.enabled}
              onChange={(event) => updateSlot(index, { end: event.target.value })}
              aria-label={`${slot.day} end`}
            />
            <label className="inline-flex items-center gap-2 text-[length:var(--text-sm)]">
              <input
                type="checkbox"
                checked={slot.enabled}
                onChange={(event) =>
                  updateSlot(index, { enabled: event.target.checked })
                }
              />
              On
            </label>
          </div>
        ))}
      </div>
    </div>
  );
}
