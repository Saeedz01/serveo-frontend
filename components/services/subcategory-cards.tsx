"use client";

import Image from "next/image";
import { Skeleton, Typography } from "@/components/ui";
import { cx } from "@/lib/cx";

export type SubcategoryCardItem = {
  id: string;
  label: string;
  description?: string | null;
  parentLabel?: string;
  imageSrc: string;
};

type SubcategoryCardsProps = {
  items: SubcategoryCardItem[];
  activeId: string | null;
  featured?: boolean;
  onSelect: (id: string) => void;
};

const SKELETON_COUNT = 14;

export function SubcategoryCardsSkeleton() {
  return (
    <div
      className="grid grid-cols-3 justify-items-center gap-x-[var(--space-3)] gap-y-[var(--space-5)] sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-7"
      role="status"
      aria-live="polite"
      aria-label="Loading specialties"
    >
      {Array.from({ length: SKELETON_COUNT }).map((_, index) => (
        <div
          key={index}
          className="flex w-full max-w-[112px] flex-col items-center gap-[var(--space-2)]"
        >
          <Skeleton className="aspect-square w-full rounded-[var(--radius-md)]" />
          <Skeleton className="h-3.5 w-16 max-w-full" />
          <Skeleton className="h-3.5 w-12 max-w-full" />
        </div>
      ))}
      <span className="sr-only">Loading specialties…</span>
    </div>
  );
}

export function SubcategoryCards({
  items,
  activeId,
  featured = false,
  onSelect,
}: SubcategoryCardsProps) {
  if (items.length === 0) {
    return (
      <div className="rounded-[var(--radius-xl)] border border-border bg-secondary/40 px-[var(--space-5)] py-[var(--space-7)] text-center">
        <Typography variant="body" className="text-muted">
          No specialties available yet.
        </Typography>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-[var(--space-3)]">
      {featured ? (
        <Typography variant="label" className="text-muted">
          Popular specialties
        </Typography>
      ) : (
        <Typography variant="label" className="text-muted">
          Choose a specialty
        </Typography>
      )}
      <div
        className="grid grid-cols-3 justify-items-center gap-x-[var(--space-3)] gap-y-[var(--space-5)] sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-7"
        role="listbox"
        aria-label={featured ? "Popular specialties" : "Specialties"}
      >
        {items.map((item) => {
          const isActive = item.id === activeId;
          return (
            <button
              key={item.id}
              type="button"
              role="option"
              aria-selected={isActive}
              onClick={() => onSelect(item.id)}
              className={cx(
                "group flex w-full max-w-[112px] cursor-pointer flex-col items-center gap-[var(--space-2)] text-center",
                "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
              )}
            >
              <span
                className={cx(
                  "relative flex aspect-square w-full items-center justify-center overflow-hidden rounded-[var(--radius-md)] bg-[#F2F4F5] p-[18%] transition-[background-color,box-shadow,ring]",
                  isActive
                    ? "ring-2 ring-primary/40 ring-offset-2 ring-offset-background"
                    : "group-hover:bg-[#E8EBED]",
                )}
              >
                <Image
                  src={item.imageSrc}
                  alt=""
                  width={120}
                  height={120}
                  className="h-full w-full object-contain transition-transform duration-200 group-hover:scale-105"
                  aria-hidden
                />
              </span>
              <Typography
                variant="label"
                className={cx(
                  "line-clamp-2 min-h-[2.5em] w-full text-center text-[13px] font-semibold leading-snug",
                  isActive ? "text-primary" : "text-foreground",
                )}
              >
                {item.label}
              </Typography>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function hashId(id: string): number {
  let hash = 0;
  for (let i = 0; i < id.length; i += 1) {
    hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
  }
  return hash;
}

/**
 * Deterministic “random” subset (SSR-safe). Looks shuffled without hydration flicker.
 */
export function pickRandomSubcategories<T extends { id: string }>(
  items: T[],
  count: number,
): T[] {
  if (items.length <= count) return items;
  return [...items]
    .sort((a, b) => hashId(a.id) - hashId(b.id) || a.id.localeCompare(b.id))
    .slice(0, count);
}
