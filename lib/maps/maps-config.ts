/**
 * Google Maps setup for Serveo.
 *
 * 1. Create a key in Google Cloud Console
 * 2. Enable Maps JavaScript API (and Geocoding API for reverse address)
 * 3. Add to `.env.local`:
 *    NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_key_here
 * 4. Restart `next dev`
 *
 * Until the key is set, location UI still collects address + coordinates
 * via text input and browser geolocation; the map shows a ready placeholder.
 */
export const GOOGLE_MAPS_API_KEY =
  process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? "";

export const isGoogleMapsConfigured = () => Boolean(GOOGLE_MAPS_API_KEY.trim());

/** Default map center when the seeker has not picked a pin yet. */
export const DEFAULT_MAP_CENTER = {
  lat: 40.7128,
  lng: -74.006,
} as const;
