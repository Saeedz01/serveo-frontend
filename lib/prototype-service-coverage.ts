import {
  isPlaceholderServiceAddress,
  sampleServiceLocation,
} from "./catalog/sample-service-locations";
import {
  defaultAvailability,
  hasUsableAvailability,
} from "./prototype-availability";
import type { PrototypeService } from "./prototype-types";

/**
 * Ensures every service has seeker-visible location + availability.
 * Safe to run on migrate so existing localStorage profiles get filled once.
 */
export function ensureServiceCoverage(
  service: PrototypeService,
): PrototypeService {
  const sample = sampleServiceLocation(service.id);
  const needsAddress = isPlaceholderServiceAddress(service.address);
  const needsCoords =
    typeof service.lat !== "number" || typeof service.lng !== "number";
  const needsAvailability = !hasUsableAvailability(service.availability);

  if (!needsAddress && !needsCoords && !needsAvailability) {
    return service;
  }

  return {
    ...service,
    address: needsAddress ? sample.address : service.address,
    lat: needsCoords ? sample.lat : service.lat,
    lng: needsCoords ? sample.lng : service.lng,
    availability: needsAvailability
      ? defaultAvailability()
      : service.availability,
  };
}

export function ensureServicesCoverage(
  services: PrototypeService[],
): PrototypeService[] {
  return services.map(ensureServiceCoverage);
}
