import { sampleServiceLocation } from "./catalog/sample-service-locations";
import {
  defaultAvailability,
  weekendAvailability,
} from "./prototype-availability";
import { catalogServices } from "./services-catalog";
import {
  type PriceUnit,
  type PrototypeService,
} from "./prototype-types";

const CATALOG_PROVIDER_ID = "prov-verified";

function parsePrice(priceLabel: string): {
  amount: number;
  unit: PriceUnit;
} {
  const amountMatch = priceLabel.match(/\$(\d+)/);
  const amount = amountMatch ? Number(amountMatch[1]) : 49;
  if (/\/hr|hour/i.test(priceLabel)) return { amount, unit: "hour" };
  if (/flat/i.test(priceLabel)) return { amount, unit: "flat" };
  return { amount, unit: "project" };
}

/** Extra marketplace listings that were missing from the static catalog. */
const EXTRA_CATALOG: Array<{
  id: string;
  title: string;
  description: string;
  priceLabel: string;
  imageSrc: string;
  categoryId: string;
  address: string;
}> = [
  {
    id: "event-catering",
    title: "Event Catering",
    description:
      "Buffet and plated catering for small gatherings, parties, and office events.",
    priceLabel: "Projects starting at $199",
    imageSrc:
      "https://images.unsplash.com/photo-1555244162-803834f70033?auto=format&fit=crop&w=800&q=80",
    categoryId: "trending",
    address: "Citywide catering kitchen",
  },
  {
    id: "birthday-catering",
    title: "Birthday Party Catering",
    description: "Finger foods, cake service, and setup for birthday parties.",
    priceLabel: "Projects starting at $149",
    imageSrc:
      "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?auto=format&fit=crop&w=800&q=80",
    categoryId: "trending",
    address: "Metro catering hub",
  },
];

function toPrototypeService(input: {
  id: string;
  title: string;
  description: string;
  priceLabel: string;
  imageSrc: string;
  categoryId: string;
  address: string;
  index: number;
}): PrototypeService {
  const { amount, unit } = parsePrice(input.priceLabel);
  const location = sampleServiceLocation(input.id);
  const address =
    input.address.trim() && input.address !== "Serveo marketplace"
      ? input.address
      : location.address;
  return {
    id: input.id,
    providerId: CATALOG_PROVIDER_ID,
    categoryId: input.categoryId,
    cityId: "",
    title: input.title,
    description: input.description,
    imageUrl: input.imageSrc,
    address,
    lat: location.lat,
    lng: location.lng,
    radiusKm: 12,
    priceAmount: amount,
    priceUnit: unit,
    availability:
      input.index % 2 === 0 ? defaultAvailability() : weekendAvailability(),
    status: "published",
    createdAt: `2026-09-${String(10 + (input.index % 18)).padStart(2, "0")}T12:00:00.000Z`,
  };
}

/**
 * Static catalog + extras as prototype services so every browser
 * (including incognito) and the admin panel share the same listings.
 */
export function catalogPrototypeServices(): PrototypeService[] {
  const fromCatalog = catalogServices.map((service, index) =>
    toPrototypeService({
      id: service.id,
      title: service.title,
      description: `Book trusted help for ${service.title.toLowerCase()}.`,
      priceLabel: service.priceLabel,
      imageSrc: service.imageSrc,
      categoryId: service.categoryId,
      address: sampleServiceLocation(service.id).address,
      index,
    }),
  );

  const extras = EXTRA_CATALOG.map((service, index) =>
    toPrototypeService({
      ...service,
      index: fromCatalog.length + index,
    }),
  );

  return [...fromCatalog, ...extras];
}

/** Merge any missing catalog-origin services into existing state. */
export function ensureCatalogServices(
  services: PrototypeService[],
): PrototypeService[] {
  const existing = new Set(services.map((service) => service.id));
  const missing = catalogPrototypeServices().filter(
    (service) => !existing.has(service.id),
  );
  if (missing.length === 0) return services;
  return [...services, ...missing];
}
