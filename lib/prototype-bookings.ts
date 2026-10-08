import type { PrototypeBooking, PrototypeState } from "./prototype-types";

export function normalizePhone(phone: string) {
  return phone.replace(/[^\d+]/g, "");
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
