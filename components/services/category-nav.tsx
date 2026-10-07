"use client";

import { cx } from "@/lib/cx";
import { Typography } from "@/components/ui";
import type { ServiceCategory } from "@/lib/services-catalog";

type CategoryNavProps = {
  categories: ServiceCategory[];
  activeId: string | null;
  onSelect: (id: string | null) => void;
};

export function CategoryNav({
  categories,
  activeId,
  onSelect,
}: CategoryNavProps) {
  return (
    <div
      className="flex gap-[var(--space-2)] overflow-x-auto pb-[var(--space-2)] [-ms-overflow-style:none] [scrollbar-width:none] sm:justify-between sm:gap-[var(--space-3)] [&::-webkit-scrollbar]:hidden"
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
            className="group flex min-w-[88px] flex-col items-center gap-[var(--space-2)] px-[var(--space-2)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
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
                "border-b-2 pb-1 transition-colors",
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
  );
}
