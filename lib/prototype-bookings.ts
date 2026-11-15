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

/** Human-friendly age, e.g. "2 days ago". */
export function formatRelativeTime(iso: string | undefined) {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";

  const diffMs = Date.now() - date.getTime();
  const future = diffMs < 0;
  const absMs = Math.abs(diffMs);
  const minute = 60_000;
  const hour = 60 * minute;
  const day = 24 * hour;

  let label: string;
  if (absMs < minute) {
    label = "just now";
  } else if (absMs < hour) {
    const n = Math.round(absMs / minute);
    label = `${n} minute${n === 1 ? "" : "s"} ago`;
  } else if (absMs < day) {
    const n = Math.round(absMs / hour);
    label = `${n} hour${n === 1 ? "" : "s"} ago`;
  } else if (absMs < 30 * day) {
    const n = Math.round(absMs / day);
    label = `${n} day${n === 1 ? "" : "s"} ago`;
  } else {
    const n = Math.round(absMs / (30 * day));
    label = `${n} month${n === 1 ? "" : "s"} ago`;
  }

  if (future && label !== "just now") {
    return label.replace(" ago", " from now");
  }
  return label;
}

/**
 * Compact review age for marketplace UI:
 * "just now", "5 min ago", "3 hr ago", "a day ago", "3 days ago", "6 mon ago".
 */
export function formatReviewAge(iso: string | undefined) {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";

  const absMs = Math.max(0, Date.now() - date.getTime());
  const minute = 60_000;
  const hour = 60 * minute;
  const day = 24 * hour;
  const month = 30 * day;
  const year = 365 * day;

  if (absMs < minute) return "just now";
  if (absMs < hour) {
    const n = Math.max(1, Math.round(absMs / minute));
    return `${n} min ago`;
  }
  if (absMs < day) {
    const n = Math.max(1, Math.round(absMs / hour));
    return `${n} hr ago`;
  }
  if (absMs < month) {
    const n = Math.max(1, Math.round(absMs / day));
    return n === 1 ? "a day ago" : `${n} days ago`;
  }
  if (absMs < year) {
    const n = Math.max(1, Math.round(absMs / month));
    return n === 1 ? "a mon ago" : `${n} mon ago`;
  }
  const n = Math.max(1, Math.round(absMs / year));
  return n === 1 ? "a yr ago" : `${n} yr ago`;
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
