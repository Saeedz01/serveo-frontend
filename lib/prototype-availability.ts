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
