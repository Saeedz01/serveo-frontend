"use client";

import { LayoutGrid, List } from "lucide-react";
import { cx } from "@/lib/cx";

export type ViewMode = "grid" | "list";

type ViewModeToggleProps = {
  value: ViewMode;
  onChange: (mode: ViewMode) => void;
  className?: string;
};

export function ViewModeToggle({
  value,
  onChange,
  className,
}: ViewModeToggleProps) {
  return (
    <div
      role="group"
      aria-label="View mode"
      className={cx(
        "inline-flex rounded-[var(--radius-md)] border border-border bg-surface p-1",
        className,
      )}
    >
      <button
        type="button"
        aria-pressed={value === "grid"}
        aria-label="Grid view"
        onClick={() => onChange("grid")}
        className={cx(
          "inline-flex h-9 w-9 items-center justify-center rounded-[var(--radius-sm)] transition-colors",
          value === "grid"
            ? "bg-primary text-primary-foreground"
            : "text-muted hover:bg-secondary hover:text-foreground",
        )}
      >
        <LayoutGrid className="h-4 w-4" aria-hidden />
      </button>
      <button
        type="button"
        aria-pressed={value === "list"}
        aria-label="List view"
        onClick={() => onChange("list")}
        className={cx(
          "inline-flex h-9 w-9 items-center justify-center rounded-[var(--radius-sm)] transition-colors",
          value === "list"
            ? "bg-primary text-primary-foreground"
            : "text-muted hover:bg-secondary hover:text-foreground",
        )}
      >
        <List className="h-4 w-4" aria-hidden />
      </button>
    </div>
  );
}
