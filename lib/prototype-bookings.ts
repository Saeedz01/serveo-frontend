import type { PrototypeBooking, PrototypeState } from "./prototype-types";

export function normalizePhone(phone: string) {
  return phone.replace(/[^\d+]/g, "");
}

export function formatBookingDateTime(iso: string | undefined) {
  if (!iso) return "Time not set";
  try {
    return new Intl.DateTimeFormat(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

/** Value for `<input type="datetime-local" />` from an ISO string. */
export function toDateTimeLocalValue(iso: string) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function fromDateTimeLocalValue(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString();
}

export function bookingsForSeeker(
  state: PrototypeState,
  seekerId: string,
  seekerPhone?: string,
): PrototypeBooking[] {
  const phoneKey = seekerPhone ? normalizePhone(seekerPhone) : "";

  return (state.bookings ?? [])
    .filter((booking) => {
      if (booking.seekerId && booking.seekerId === seekerId) return true;
      if (phoneKey && normalizePhone(booking.seekerPhone) === phoneKey) {
        return true;
      }
      return false;
    })
    .slice()
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function bookingsForSeekerPhone(
  state: PrototypeState,
  phone: string,
): PrototypeBooking[] {
  const phoneKey = normalizePhone(phone);
  if (!phoneKey) return [];

  return (state.bookings ?? [])
    .filter((booking) => normalizePhone(booking.seekerPhone) === phoneKey)
    .slice()
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}
