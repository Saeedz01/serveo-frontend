import type { CatalogService } from "./services-catalog";
import { catalogServices } from "./services-catalog";
import {
  formatServicePrice,
  type PrototypeService,
} from "./prototype-types";

export type MarketplaceItem = {
  id: string;
  title: string;
  description: string;
  priceLabel: string;
  priceAmount: number;
  imageSrc: string;
  imageAlt: string;
  categoryId: string;
  address?: string;
  providerId?: string;
  providerName?: string;
  source: "catalog" | "provider";
};

export function catalogToMarketplaceItem(service: CatalogService): MarketplaceItem {
  const amountMatch = service.priceLabel.match(/\$(\d+)/);
  const priceAmount = amountMatch ? Number(amountMatch[1]) : 0;

  return {
    id: service.id,
    title: service.title,
    description: `Book trusted help for ${service.title.toLowerCase()}.`,
    priceLabel: service.priceLabel,
    priceAmount,
    imageSrc: service.imageSrc,
    imageAlt: service.imageAlt,
    categoryId: service.categoryId,
    source: "catalog",
  };
}

export function providerToMarketplaceItem(
  service: PrototypeService,
  providerName?: string,
): MarketplaceItem {
  return {
    id: service.id,
    title: service.title,
    description: service.description,
    priceLabel: formatServicePrice(service.priceAmount, service.priceUnit),
    priceAmount: service.priceAmount,
    imageSrc: service.imageUrl,
    imageAlt: service.title,
    categoryId: service.categoryId,
    address: service.address,
    providerId: service.providerId,
    providerName,
    source: "provider",
  };
}

export function buildMarketplaceItems(
  publishedServices: PrototypeService[],
  providerNameById: (id: string) => string | undefined,
): MarketplaceItem[] {
  const providerItems = publishedServices.map((service) =>
    providerToMarketplaceItem(service, providerNameById(service.providerId)),
  );
  // Prefer prototype/localStorage services; keep catalog only as a gap-fill
  // so older clients without migration still show the full marketplace.
  const existingIds = new Set(providerItems.map((item) => item.id));
  const catalogItems = catalogServices
    .filter((service) => !existingIds.has(service.id))
    .map(catalogToMarketplaceItem);
  return [...providerItems, ...catalogItems];
}

export function filterMarketplaceItems(
  items: MarketplaceItem[],
  {
    categoryId,
    query,
  }: {
    categoryId?: string | null;
    query?: string;
  },
) {
  const normalizedQuery = query?.trim().toLowerCase() ?? "";

  return items.filter((item) => {
    const matchesCategory = categoryId ? item.categoryId === categoryId : true;
    const matchesQuery = normalizedQuery
      ? item.title.toLowerCase().includes(normalizedQuery) ||
        item.priceLabel.toLowerCase().includes(normalizedQuery) ||
        item.description.toLowerCase().includes(normalizedQuery)
      : true;
    return matchesCategory && matchesQuery;
  });
}

export function findMarketplaceItem(
  id: string,
  publishedServices: PrototypeService[],
  providerNameById: (id: string) => string | undefined,
): MarketplaceItem | undefined {
  const providerService = publishedServices.find((service) => service.id === id);
  if (providerService) {
    return providerToMarketplaceItem(
      providerService,
      providerNameById(providerService.providerId),
    );
  }

  const catalog = catalogServices.find((service) => service.id === id);
  return catalog ? catalogToMarketplaceItem(catalog) : undefined;
}
