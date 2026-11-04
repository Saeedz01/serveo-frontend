"use client";

import { useMemo, useState } from "react";
import { ArrowRight } from "lucide-react";
import { Button, Container, SearchField, Typography } from "@/components/ui";
import { usePrototype } from "@/components/prototype/prototype-provider";
import { iconForCategorySlug } from "@/lib/category-icons";
import {
  buildMarketplaceItems,
  filterMarketplaceItems,
} from "@/lib/marketplace";
import type { ServiceCategory } from "@/lib/services-catalog";
import { useGetServiceCategoriesQuery } from "@/service/api";
import { CatalogScrollSentinel } from "./catalog-scroll-sentinel";
import { CategoryNav } from "./category-nav";
import { ServicesCards } from "./services-cards";
import { useInfiniteCatalog } from "./use-infinite-catalog";

type ServicesExplorerProps = {
  showHeading?: boolean;
  showViewAll?: boolean;
  /** Hard cap for home preview — skips infinite scroll. */
  limit?: number;
};

export function ServicesExplorer({
  showHeading = true,
  showViewAll = false,
  limit,
}: ServicesExplorerProps) {
  const { ready, state, ratingForProvider } = usePrototype();
  const { data: systemCategories = [] } = useGetServiceCategoriesQuery();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [draftQuery, setDraftQuery] = useState("");
  const [query, setQuery] = useState("");

  const navCategories = useMemo<ServiceCategory[]>(
    () =>
      systemCategories.map((category) => ({
        id: category.id,
        label: category.name,
        icon: iconForCategorySlug(category.slug),
      })),
    [systemCategories],
  );

  const activeCategory = useMemo(
    () => systemCategories.find((category) => category.id === activeId) ?? null,
    [activeId, systemCategories],
  );

  const marketplace = useMemo(() => {
    const published = state.services.filter(
      (service) => service.status === "published",
    );
    return buildMarketplaceItems(
      published,
      (providerId) =>
        state.providers.find((provider) => provider.id === providerId)?.name,
      (providerId) => ratingForProvider(providerId),
    );
  }, [ratingForProvider, state.providers, state.services]);

  const filtered = useMemo(
    () =>
      filterMarketplaceItems(marketplace, {
        categoryId: activeId,
        categorySlug: activeCategory?.slug,
        query,
      }),
    [activeCategory?.slug, activeId, marketplace, query],
  );

  const useWindowing = typeof limit !== "number";
  const resetKey = `${activeId ?? "all"}:${query.trim().toLowerCase()}`;

  const infinite = useInfiniteCatalog(filtered, {
    resetKey,
    enabled: ready && useWindowing,
  });

  const visible = useWindowing
    ? infinite.items
    : filtered.slice(0, limit);

  return (
    <Container className="flex flex-col gap-[var(--space-6)]">
      {showHeading ? (
        <div className="mx-auto max-w-2xl text-center">
          <Typography variant="h2" className="mb-[var(--space-3)]">
            What do you need help with?
          </Typography>
          <Typography variant="bodyLarge">
            Search or pick a category to browse matching services.
          </Typography>
        </div>
      ) : null}

      <SearchField
        value={draftQuery}
        onChange={(event) => setDraftQuery(event.target.value)}
        onSearch={() => setQuery(draftQuery)}
        placeholder="Search for a service..."
        aria-label="Search services"
        wrapperClassName="mx-auto max-w-2xl"
      />

      {navCategories.length > 0 ? (
        <CategoryNav
          categories={navCategories}
          activeId={activeId}
          onSelect={setActiveId}
        />
      ) : null}

      {!ready ? (
        <Typography variant="body" className="text-center text-muted">
          Loading services...
        </Typography>
      ) : (
        <>
          <ServicesCards services={visible} />
          {useWindowing ? (
            <CatalogScrollSentinel
              hasMore={infinite.hasMore}
              total={infinite.total}
              visible={visible.length}
              sentinelRef={infinite.sentinelRef}
            />
          ) : null}
        </>
      )}

      {showViewAll ? (
        <div className="flex justify-center pt-[var(--space-2)]">
          <Button
            as="a"
            href="/services"
            variant="secondary"
            className="rounded-[var(--radius-full)] px-6"
          >
            View all services
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Button>
        </div>
      ) : null}
    </Container>
  );
}
