/** Session-only guest browsing flag (not persisted). */
let guestMode = false;

export function isGuestMode(): boolean {
  return guestMode;
}

export function enableGuestMode() {
  guestMode = true;
}

export function clearGuestMode() {
  guestMode = false;
}
