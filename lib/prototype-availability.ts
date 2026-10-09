import type { AvailabilitySlot } from "./prototype-types";

export const defaultAvailability = (): AvailabilitySlot[] => [
  { day: "Mon", enabled: true, start: "09:00", end: "17:00" },
  { day: "Tue", enabled: true, start: "09:00", end: "17:00" },
  { day: "Wed", enabled: true, start: "09:00", end: "17:00" },
  { day: "Thu", enabled: true, start: "09:00", end: "17:00" },
  { day: "Fri", enabled: true, start: "09:00", end: "17:00" },
  { day: "Sat", enabled: false, start: "10:00", end: "14:00" },
  { day: "Sun", enabled: false, start: "10:00", end: "14:00" },
];

/** Weekend-friendly sample schedule for seeded marketplace listings. */
export const weekendAvailability = (): AvailabilitySlot[] => [
  { day: "Mon", enabled: true, start: "10:00", end: "18:00" },
  { day: "Tue", enabled: true, start: "10:00", end: "18:00" },
  { day: "Wed", enabled: true, start: "10:00", end: "18:00" },
  { day: "Thu", enabled: true, start: "10:00", end: "18:00" },
  { day: "Fri", enabled: true, start: "10:00", end: "18:00" },
  { day: "Sat", enabled: true, start: "09:00", end: "15:00" },
  { day: "Sun", enabled: true, start: "10:00", end: "14:00" },
];

export function enabledAvailabilitySlots(
  availability: AvailabilitySlot[] | undefined,
): AvailabilitySlot[] {
  return (availability ?? []).filter((slot) => slot.enabled);
}

export function formatAvailabilityWindow(slot: AvailabilitySlot): string {
  return `${slot.day} ${slot.start}–${slot.end}`;
}

export function hasUsableAvailability(
  availability: AvailabilitySlot[] | undefined,
): boolean {
  return enabledAvailabilitySlots(availability).length > 0;
}
