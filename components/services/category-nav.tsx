"use client";

import { useEffect, useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { cx } from "@/lib/cx";
import { Button, Skeleton, Typography } from "@/components/ui";
import type { ServiceCategory } from "@/lib/services-catalog";

type CategoryNavProps = {
  categories: ServiceCategory[];
  activeId: string | null;
  onSelect: (id: string | null) => void;
};

/** Smallest collapsed preview (mobile 3 cols × 2 rows). */
const COLLAPSED_MIN = 6;

/** Matches the collapsed category grid while categories load from the API. */
const SKELETON_COUNT = 8;

export function CategoryNavSkeleton() {
  return (
    <div
      className="grid grid-cols-3 justify-items-center gap-x-[var(--space-2)] gap-y-[var(--space-4)] sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8"
      role="status"
      aria-live="polite"
      aria-label="Loading categories"
    >
      {Array.from({ length: SKELETON_COUNT }).map((_, index) => (
        <div
          key={index}
          className="flex w-full max-w-[120px] flex-col items-center gap-[var(--space-2)] px-[var(--space-1)]"
        >
          <Skeleton className="h-14 w-14 rounded-[var(--radius-full)]" />
          <Skeleton className="mt-1 h-3.5 w-16" />
          <Skeleton className="h-3.5 w-12" />
        </div>
      ))}
      <span className="sr-only">Loading categories…</span>
    </div>
  );
}

export function CategoryNav({
  categories,
  activeId,
  onSelect,
}: CategoryNavProps) {
  const [expanded, setExpanded] = useState(false);
  const canToggle = categories.length > COLLAPSED_MIN;

  useEffect(() => {
    if (!activeId || expanded) return;
    const activeIndex = categories.findIndex(
      (category) => category.id === activeId,
    );
    // Keep the selected chip visible if it would fall outside the 2-row preview.
    if (activeIndex >= COLLAPSED_MIN) {
      setExpanded(true);
    }
  }, [activeId, categories, expanded]);

  return (
    <div className="flex flex-col gap-[var(--space-3)]">
      <div
        className={cx(
          "grid grid-cols-3 justify-items-center gap-x-[var(--space-2)] gap-y-[var(--space-4)] sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8",
          // Two-row preview: 3×2 / 4×2 / 6×2 / 8×2 by breakpoint.
          !expanded &&
            canToggle &&
            "max-sm:[&>*:nth-child(n+7)]:hidden sm:max-md:[&>*:nth-child(n+9)]:hidden md:max-lg:[&>*:nth-child(n+13)]:hidden lg:[&>*:nth-child(n+17)]:hidden",
        )}
        role="tablist"
        aria-label="Service categories"
      >
        {categories.map((category) => {
          const Icon = category.icon;
          const isActive = category.id === activeId;

          return (
            <button
              key={category.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              aria-controls="filtered-services"
              id={`category-${category.id}`}
              onClick={() => onSelect(isActive ? null : category.id)}
              className="group flex w-full max-w-[120px] cursor-pointer flex-col items-center gap-[var(--space-2)] px-[var(--space-1)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
            >
              <span
                className={cx(
                  "flex h-14 w-14 items-center justify-center rounded-[var(--radius-full)] transition-colors",
                  isActive
                    ? "bg-primary-soft text-primary"
                    : "bg-transparent text-foreground group-hover:bg-secondary",
                )}
              >
                <Icon className="h-7 w-7 stroke-[1.5]" aria-hidden />
              </span>
              <Typography
                variant="label"
                className={cx(
                  "line-clamp-2 min-h-[2.5em] border-b-2 pb-1 text-center leading-snug transition-colors",
                  isActive
                    ? "border-primary text-primary"
                    : "border-transparent text-foreground group-hover:text-primary",
                )}
              >
                {category.label}
              </Typography>
            </button>
          );
        })}
      </div>

      {canToggle ? (
        <div className="flex justify-center">
          <Button
            type="button"
            variant="ghost"
            className="cursor-pointer rounded-[var(--radius-full)]"
            aria-expanded={expanded}
            onClick={() => setExpanded((value) => !value)}
          >
            {expanded ? (
              <>
                Show fewer categories
                <ChevronUp className="h-4 w-4" aria-hidden />
              </>
            ) : (
              <>
                See all categories
                <ChevronDown className="h-4 w-4" aria-hidden />
              </>
            )}
          </Button>
        </div>
      ) : null}
    </div>
  );
}
