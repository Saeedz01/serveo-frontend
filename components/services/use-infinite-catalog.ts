"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  CATALOG_INITIAL_LIMIT,
  CATALOG_PAGE_SIZE,
  paginateCatalogItems,
} from "@/lib/catalog/catalog-pagination";

type UseInfiniteCatalogOptions = {
  /** Change this when filters/search change so visible window resets. */
  resetKey: string;
  enabled?: boolean;
  initialLimit?: number;
  pageSize?: number;
};

/**
 * Windowed catalog list for infinite scroll.
 * Swap the `items` source for an API-backed page merger later without changing call sites.
 */
export function useInfiniteCatalog<T>(
  items: T[],
  {
    resetKey,
    enabled = true,
    initialLimit = CATALOG_INITIAL_LIMIT,
    pageSize = CATALOG_PAGE_SIZE,
  }: UseInfiniteCatalogOptions,
) {
  const [visibleCount, setVisibleCount] = useState(initialLimit);
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const itemsLength = items.length;

  useEffect(() => {
    setVisibleCount(initialLimit);
  }, [resetKey, initialLimit]);

  const page = useMemo(
    () => paginateCatalogItems(items, 0, visibleCount),
    [items, visibleCount],
  );

  const hasMore = page.hasMore;

  useEffect(() => {
    if (!enabled || !hasMore) return;
    const node = sentinelRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry?.isIntersecting) return;
        observer.unobserve(node);
        setVisibleCount((count) => Math.min(count + pageSize, itemsLength));
      },
      { root: null, rootMargin: "160px 0px", threshold: 0 },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [enabled, hasMore, itemsLength, pageSize, visibleCount]);

  return {
    items: page.items,
    total: page.total,
    hasMore,
    sentinelRef,
  };
}
