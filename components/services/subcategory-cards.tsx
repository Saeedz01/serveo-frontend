"use client";

import type { LucideIcon } from "lucide-react";
import { Skeleton, Typography } from "@/components/ui";
import { cx } from "@/lib/cx";

export type SubcategoryCardItem = {
  id: string;
  label: string;
  description?: string | null;
  parentLabel?: string;
  icon: LucideIcon;
};

type SubcategoryCardsProps = {
  items: SubcategoryCardItem[];
  activeId: string | null;
  featured?: boolean;
  onSelect: (id: string) => void;
};

const SKELETON_COUNT = 8;

export function SubcategoryCardsSkeleton() {
  return (
    <div
      className="grid grid-cols-2 gap-[var(--space-3)] sm:grid-cols-3 md:grid-cols-4"
      role="status"
      aria-live="polite"
      aria-label="Loading specialties"
    >
      {Array.from({ length: SKELETON_COUNT }).map((_, index) => (
        <div
          key={index}
          className="rounded-[var(--radius-xl)] border border-border bg-surface p-[var(--space-4)]"
        >
          <Skeleton className="mb-3 h-11 w-11 rounded-[var(--radius-lg)]" />
          <Skeleton className="mb-2 h-4 w-24 max-w-full" />
          <Skeleton className="h-3 w-16 max-w-full" />
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
        className="grid grid-cols-2 gap-[var(--space-3)] sm:grid-cols-3 md:grid-cols-4"
        role="listbox"
        aria-label={featured ? "Popular specialties" : "Specialties"}
      >
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = item.id === activeId;
          return (
            <button
              key={item.id}
              type="button"
              role="option"
              aria-selected={isActive}
              onClick={() => onSelect(item.id)}
              className={cx(
                "group flex flex-col items-start gap-[var(--space-3)] rounded-[var(--radius-xl)] border bg-surface p-[var(--space-4)] text-left shadow-[0_12px_28px_-24px_rgba(10,10,10,0.45)] transition-[transform,border-color,box-shadow,background-color]",
                "hover:-translate-y-0.5 hover:border-primary/35 hover:shadow-[0_18px_36px_-24px_rgba(92,61,145,0.35)]",
                "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
                isActive
                  ? "border-primary bg-primary-soft/40 ring-1 ring-primary/25"
                  : "border-border",
              )}
            >
              <span
                className={cx(
                  "flex h-11 w-11 items-center justify-center rounded-[var(--radius-lg)] transition-colors",
                  isActive
                    ? "bg-primary text-white"
                    : "bg-secondary text-primary group-hover:bg-primary-soft",
                )}
              >
                <Icon className="h-5 w-5 stroke-[1.6]" aria-hidden />
              </span>
              <span className="min-w-0 space-y-1">
                <Typography
                  variant="label"
                  className={cx(
                    "line-clamp-2 leading-snug",
                    isActive ? "text-primary" : "text-foreground",
                  )}
                >
                  {item.label}
                </Typography>
                {item.parentLabel ? (
                  <Typography
                    variant="caption"
                    className="line-clamp-1 text-muted"
                  >
                    {item.parentLabel}
                  </Typography>
                ) : item.description ? (
                  <Typography
                    variant="caption"
                    className="line-clamp-2 text-muted"
                  >
                    {item.description}
                  </Typography>
                ) : null}
              </span>
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
