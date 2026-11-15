"use client";

import { useMemo, useState } from "react";
import { ArrowRight, Layers3, MapPin } from "lucide-react";
import { Button, Container, Typography } from "@/components/ui";
import { usePrototype } from "@/components/prototype/prototype-provider";
import {
  buildMarketplaceItems,
  filterMarketplaceItems,
} from "@/lib/marketplace";
import { imageForSubcategorySlug } from "@/lib/subcategory-icons";
import {
  useGetServiceCategoriesQuery,
  useGetServiceCitiesQuery,
} from "@/service/api";
import { CatalogScrollSentinel } from "./catalog-scroll-sentinel";
import { ExplorerSelect } from "./explorer-select";
import { ServicesCards } from "./services-cards";
import {
  pickRandomSubcategories,
  SubcategoryCards,
  SubcategoryCardsSkeleton,
  type SubcategoryCardItem,
} from "./subcategory-cards";
import { useInfiniteCatalog } from "./use-infinite-catalog";

type ServicesExplorerProps = {
  showHeading?: boolean;
  showViewAll?: boolean;
  /** Hard cap for home preview — skips infinite scroll. */
  limit?: number;
};

/** Two rows × seven columns on large screens (OLX-style grid). */
const FEATURED_SUBCATEGORY_COUNT = 14;

export function ServicesExplorer({
  showHeading = true,
  showViewAll = false,
  limit,
}: ServicesExplorerProps) {
  const { ready, state, ratingForProvider } = usePrototype();
  const {
    data: allCategories = [],
    isLoading: categoriesLoading,
  } = useGetServiceCategoriesQuery();
  const {
    data: cities = [],
    isLoading: citiesLoading,
  } = useGetServiceCitiesQuery();

  const [cityId, setCityId] = useState("");
  const [parentCategoryId, setParentCategoryId] = useState("");
  const [activeSubcategoryId, setActiveSubcategoryId] = useState<string | null>(
    null,
  );
  const [highlightCity, setHighlightCity] = useState(false);

  // Search is hidden for now (may return later).
  const query = "";

  const rootCategories = useMemo(
    () => allCategories.filter((category) => category.parentId === null),
    [allCategories],
  );

  const rootById = useMemo(
    () => new Map(rootCategories.map((category) => [category.id, category])),
    [rootCategories],
  );

  const leafCategories = useMemo(
    () => allCategories.filter((category) => category.parentId !== null),
    [allCategories],
  );

  const cityOptions = useMemo(
    () => cities.map((city) => ({ id: city.id, label: city.name })),
    [cities],
  );

  const categoryOptions = useMemo(
    () =>
      rootCategories.map((category) => ({
        id: category.id,
        label: category.name,
        description: category.description ?? undefined,
      })),
    [rootCategories],
  );

  const filteredLeafCards = useMemo<SubcategoryCardItem[]>(() => {
    const source = parentCategoryId
      ? leafCategories.filter(
          (category) => category.parentId === parentCategoryId,
        )
      : pickRandomSubcategories(leafCategories, FEATURED_SUBCATEGORY_COUNT);

    return source.map((category) => {
      const parent = category.parentId
        ? rootById.get(category.parentId)
        : undefined;
      return {
        id: category.id,
        label: category.name,
        description: category.description,
        parentLabel: parentCategoryId ? undefined : parent?.name,
        imageSrc: imageForSubcategorySlug(category.slug),
      };
    });
  }, [leafCategories, parentCategoryId, rootById]);

  const activeSubcategory = useMemo(
    () =>
      allCategories.find((category) => category.id === activeSubcategoryId) ??
      null,
    [activeSubcategoryId, allCategories],
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
        categoryId: activeSubcategoryId,
        categorySlug: activeSubcategory?.slug,
        cityId: cityId || null,
        query,
      }),
    [activeSubcategory?.slug, activeSubcategoryId, cityId, marketplace, query],
  );

  const useWindowing = typeof limit !== "number";
  const resetKey = `${cityId}:${activeSubcategoryId ?? "none"}`;

  const infinite = useInfiniteCatalog(filtered, {
    resetKey,
    enabled: ready && useWindowing && Boolean(activeSubcategoryId && cityId),
  });

  const visible = useWindowing
    ? infinite.items
    : filtered.slice(0, limit);

  const showResults = Boolean(cityId && activeSubcategoryId);
  const showingFeatured = !parentCategoryId;

  const handleSubcategorySelect = (id: string) => {
    const leaf = leafCategories.find((category) => category.id === id);
    if (!leaf) return;

    if (leaf.parentId && leaf.parentId !== parentCategoryId) {
      setParentCategoryId(leaf.parentId);
    }
    setActiveSubcategoryId((current) => (current === id ? null : id));

    if (!cityId) {
      setHighlightCity(true);
    }
  };

  return (
    <Container className="flex flex-col gap-[var(--space-6)]">
      {showHeading ? (
        <div className="mx-auto max-w-2xl text-center">
          <Typography variant="h2" className="mb-[var(--space-3)]">
            What do you need help with?
          </Typography>
          <Typography variant="bodyLarge">
            Choose your city and a service category, then pick a specialty.
          </Typography>
        </div>
      ) : null}

      {/* SearchField intentionally hidden for now — restore later if needed. */}

      <div className="mx-auto w-full max-w-3xl rounded-[var(--radius-xl)] border border-border/80 bg-gradient-to-br from-surface via-surface to-secondary/40 p-[var(--space-4)] shadow-[0_18px_40px_-32px_rgba(10,10,10,0.35)] sm:p-[var(--space-5)]">
        <div className="grid gap-[var(--space-4)] sm:grid-cols-2">
          <ExplorerSelect
            id="explorer-city"
            label="City"
            icon={MapPin}
            value={cityId}
            options={cityOptions}
            loading={citiesLoading}
            highlight={highlightCity && !cityId}
            placeholder="Where do you need help?"
            emptyMessage="No cities available"
            onChange={(id) => {
              setCityId(id);
              setHighlightCity(false);
            }}
          />
          <ExplorerSelect
            id="explorer-category"
            label="Service category"
            icon={Layers3}
            value={parentCategoryId}
            options={categoryOptions}
            loading={categoriesLoading}
            disabled={!cityId}
            placeholder={
              cityId ? "What kind of service?" : "Select a city first"
            }
            emptyMessage="No categories available"
            onChange={(id) => {
              setParentCategoryId(id);
              setActiveSubcategoryId(null);
            }}
          />
        </div>
        {!cityId && highlightCity ? (
          <Typography
            variant="caption"
            className="mt-[var(--space-3)] text-primary"
          >
            Select a city to see providers for that specialty.
          </Typography>
        ) : null}
      </div>

      {categoriesLoading ? (
        <SubcategoryCardsSkeleton />
      ) : (
        <SubcategoryCards
          items={filteredLeafCards}
          activeId={activeSubcategoryId}
          featured={showingFeatured}
          onSelect={handleSubcategorySelect}
        />
      )}

      {!ready ? (
        <Typography variant="body" className="text-center text-muted">
          Loading services...
        </Typography>
      ) : showResults ? (
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
      ) : (
        <Typography variant="body" className="text-center text-muted">
          {!cityId
            ? "Pick a city, or tap a specialty below to get started."
            : !activeSubcategoryId
              ? parentCategoryId
                ? "Choose a specialty card to see matching providers."
                : "Optionally narrow by category, or pick a specialty card."
              : "Select a city to see matching providers."}
        </Typography>
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
