"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { Check, ChevronDown, Search } from "lucide-react";
import { Typography } from "@/components/ui";
import { cx } from "@/lib/cx";
import type { ServiceCategoryDto } from "@/service/api";

type CategoryComboboxProps = {
  id?: string;
  value: string;
  categories: ServiceCategoryDto[];
  loading?: boolean;
  invalid?: boolean;
  disabled?: boolean;
  placeholder?: string;
  onChange: (categoryId: string) => void;
};

export function CategoryCombobox({
  id,
  value,
  categories,
  loading = false,
  invalid = false,
  disabled = false,
  placeholder = "Search and select a category",
  onChange,
}: CategoryComboboxProps) {
  const listboxId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const selected = useMemo(
    () => categories.find((category) => category.id === value) ?? null,
    [categories, value],
  );

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const list = needle
      ? categories.filter(
          (category) =>
            category.name.toLowerCase().includes(needle) ||
            category.slug.toLowerCase().includes(needle),
        )
      : categories;
    // Keep "Other Services" at the bottom after search/filter.
    return [...list].sort((a, b) => {
      const aOther = a.slug === "other-services" ? 1 : 0;
      const bOther = b.slug === "other-services" ? 1 : 0;
      if (aOther !== bOther) return aOther - bOther;
      return a.name.localeCompare(b.name);
    });
  }, [categories, query]);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
        setQuery("");
      }
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        setQuery("");
      }
    };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  useEffect(() => {
    if (open) {
      window.requestAnimationFrame(() => searchRef.current?.focus());
    }
  }, [open]);

  const toggle = () => {
    if (disabled || loading) return;
    setOpen((prev) => {
      const next = !prev;
      if (!next) setQuery("");
      return next;
    });
  };

  return (
    <div ref={rootRef} className="relative">
      <button
        id={id}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listboxId}
        aria-invalid={invalid || undefined}
        disabled={disabled || loading}
        onClick={toggle}
        className={cx(
          "flex h-11 w-full items-center justify-between gap-[var(--space-2)] rounded-[var(--radius-md)] border bg-surface px-[var(--space-3)] text-left text-[length:var(--text-base)] outline-none transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-60",
          invalid
            ? "border-error focus-visible:outline-error"
            : "border-border focus-visible:outline-primary",
        )}
      >
        <span
          className={cx(
            "truncate",
            selected ? "text-foreground" : "text-muted",
          )}
        >
          {loading
            ? "Loading categories..."
            : (selected?.name ?? placeholder)}
        </span>
        <ChevronDown
          className={cx(
            "h-4 w-4 shrink-0 text-muted transition-transform",
            open && "rotate-180",
          )}
          aria-hidden
        />
      </button>

      {open ? (
        <div className="absolute z-30 mt-2 w-full overflow-hidden rounded-[var(--radius-md)] border border-border bg-surface shadow-[0_16px_40px_-24px_rgba(10,10,10,0.45)]">
          <div className="flex items-center gap-[var(--space-2)] border-b border-border px-[var(--space-3)]">
            <Search className="h-4 w-4 shrink-0 text-muted" aria-hidden />
            <input
              ref={searchRef}
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search categories..."
              aria-label="Search categories"
              className="h-11 w-full bg-transparent text-[length:var(--text-base)] text-foreground outline-none placeholder:text-muted"
            />
          </div>

          <ul
            id={listboxId}
            role="listbox"
            aria-label="Service categories"
            className="max-h-60 overflow-y-auto py-[var(--space-1)]"
          >
            {filtered.length === 0 ? (
              <li className="px-[var(--space-3)] py-[var(--space-3)]">
                <Typography variant="caption" className="text-muted">
                  No categories match “{query.trim()}”.
                </Typography>
              </li>
            ) : (
              filtered.map((category) => {
                const isSelected = category.id === value;
                return (
                  <li key={category.id} role="option" aria-selected={isSelected}>
                    <button
                      type="button"
                      className={cx(
                        "flex w-full items-start justify-between gap-[var(--space-2)] px-[var(--space-3)] py-[var(--space-2)] text-left text-[length:var(--text-base)] transition-colors hover:bg-primary/5",
                        isSelected && "bg-primary/10 text-primary",
                      )}
                      onClick={() => {
                        onChange(category.id);
                        setOpen(false);
                        setQuery("");
                      }}
                    >
                      <span className="min-w-0">
                        <span className="block truncate font-medium">
                          {category.name}
                        </span>
                        {category.description ? (
                          <span className="mt-0.5 block text-[length:var(--text-xs)] text-muted">
                            {category.description}
                          </span>
                        ) : null}
                      </span>
                      {isSelected ? (
                        <Check className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
                      ) : null}
                    </button>
                  </li>
                );
              })
            )}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
