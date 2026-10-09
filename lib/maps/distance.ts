export type LatLng = {
  lat: number;
  lng: number;
};

const EARTH_RADIUS_KM = 6371;

function toRadians(degrees: number) {
  return (degrees * Math.PI) / 180;
}

/**
 * Straight-line distance (haversine). Used until Directions API is wired;
 * UI can swap to driving distance without changing call sites.
 */
export function haversineDistanceKm(from: LatLng, to: LatLng): number {
  const dLat = toRadians(to.lat - from.lat);
  const dLng = toRadians(to.lng - from.lng);
  const lat1 = toRadians(from.lat);
  const lat2 = toRadians(to.lat);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return EARTH_RADIUS_KM * c;
}

export function formatDistanceKm(km: number): string {
  if (!Number.isFinite(km) || km < 0) return "—";
  if (km < 1) return `${Math.round(km * 1000)} m`;
  if (km < 10) return `${km.toFixed(1)} km`;
  return `${Math.round(km)} km`;
}

/** Rough ETA from average city travel speed until Maps Directions ETA is available. */
export function estimateTravelMinutes(
  distanceKm: number,
  avgSpeedKmh = 28,
): number {
  if (!Number.isFinite(distanceKm) || distanceKm <= 0) return 0;
  return Math.max(1, Math.round((distanceKm / avgSpeedKmh) * 60));
}

export function formatTravelEstimate(distanceKm: number): string {
  const minutes = estimateTravelMinutes(distanceKm);
  if (minutes < 60) return `~${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const rem = minutes % 60;
  return rem === 0 ? `~${hours} hr` : `~${hours} hr ${rem} min`;
}

export type TripDistance = {
  distanceKm: number;
  distanceLabel: string;
  etaLabel: string;
};

export function computeTripDistance(from: LatLng, to: LatLng): TripDistance {
  const distanceKm = haversineDistanceKm(from, to);
  return {
    distanceKm,
    distanceLabel: formatDistanceKm(distanceKm),
    etaLabel: formatTravelEstimate(distanceKm),
  };
}
