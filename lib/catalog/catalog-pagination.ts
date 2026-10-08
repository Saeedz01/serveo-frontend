/**
 * Catalog list paging shaped like a future API response.
 * Today: offset cursors over an in-memory list.
 * Later: replace the page builder with fetch(`/api/services?...`) keeping this contract.
 */

export const CATALOG_GRID = {
  /** Matches `lg:grid-cols-4` on the public services grid. */
  columnsLg: 4,
  initialRows: 3,
  loadMoreRows: 1,
} as const;

export function catalogLimitForRows(
  rows: number,
  columns: number = CATALOG_GRID.columnsLg,
): number {
  return rows * columns;
}

export const CATALOG_INITIAL_LIMIT = catalogLimitForRows(
  CATALOG_GRID.initialRows,
);
export const CATALOG_PAGE_SIZE = catalogLimitForRows(CATALOG_GRID.loadMoreRows);

/** Opaque list cursor — number offset now; string token when the API lands. */
export type CatalogCursor = number;

export type CatalogPageResult<T> = {
  items: T[];
  nextCursor: CatalogCursor | null;
  hasMore: boolean;
  total: number;
};

export type CatalogListQuery = {
  categoryId?: string | null;
  query?: string;
  cursor?: CatalogCursor | null;
  limit?: number;
};

export function paginateCatalogItems<T>(
  items: T[],
  cursor: CatalogCursor | null | undefined,
  limit: number,
): CatalogPageResult<T> {
  const offset = Math.max(0, cursor ?? 0);
  const pageItems = items.slice(offset, offset + limit);
  const nextOffset = offset + pageItems.length;
  const hasMore = nextOffset < items.length;

  return {
    items: pageItems,
    nextCursor: hasMore ? nextOffset : null,
    hasMore,
    total: items.length,
  };
}

/** First page helper — same shape the UI will keep after the API swap. */
export function initialCatalogPage<T>(
  items: T[],
  limit: number = CATALOG_INITIAL_LIMIT,
): CatalogPageResult<T> {
  return paginateCatalogItems(items, 0, limit);
}
