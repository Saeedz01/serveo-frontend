"use client";

import { Typography } from "@/components/ui";
import type { ServiceCategoryDto } from "@/service/api";

type CategorySuggestionsProps = {
  suggestions: ServiceCategoryDto[];
  selectedId: string;
  onSelect: (categoryId: string) => void;
  label?: string;
};

export function CategorySuggestions({
  suggestions,
  selectedId,
  onSelect,
  label = "Suggested categories",
}: CategorySuggestionsProps) {
  if (suggestions.length === 0) return null;

  return (
    <div className="mt-[var(--space-2)] space-y-[var(--space-2)]">
      <Typography variant="caption" className="block text-muted">
        {label}
      </Typography>
      <div className="flex flex-wrap gap-2">
        {suggestions.map((category) => {
          const selected = category.id === selectedId;
          return (
            <button
              key={category.id}
              type="button"
              onClick={() => onSelect(category.id)}
              className={`rounded-[var(--radius-full)] border px-3 py-1 text-[length:var(--text-sm)] transition-colors ${
                selected
                  ? "border-primary bg-primary-soft text-primary"
                  : "border-border bg-surface text-foreground hover:border-primary/40 hover:bg-secondary/60"
              }`}
            >
              {category.name}
            </button>
          );
        })}
      </div>
    </div>
  );
}

type DidYouMeanProps = {
  suggestion: ServiceCategoryDto | null;
  onAccept: (categoryId: string) => void;
};

export function DidYouMeanCategory({ suggestion, onAccept }: DidYouMeanProps) {
  if (!suggestion) return null;
  return (
    <div className="mt-[var(--space-2)] rounded-[var(--radius-lg)] border border-border bg-secondary/40 px-3 py-2">
      <Typography variant="caption" className="text-muted">
        Did you mean{" "}
        <button
          type="button"
          className="font-semibold text-primary hover:underline"
          onClick={() => onAccept(suggestion.id)}
        >
          {suggestion.name}
        </button>
        ?
      </Typography>
    </div>
  );
}
