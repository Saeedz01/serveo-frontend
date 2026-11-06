"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { Check, ChevronDown, type LucideIcon, Search } from "lucide-react";
import { Typography } from "@/components/ui";
import { cx } from "@/lib/cx";

export type ExplorerSelectOption = {
  id: string;
  label: string;
  description?: string;
};

type ExplorerSelectProps = {
  id?: string;
  label: string;
  value: string;
  options: ExplorerSelectOption[];
  placeholder?: string;
  emptyMessage?: string;
  disabled?: boolean;
  loading?: boolean;
  highlight?: boolean;
  icon?: LucideIcon;
  onChange: (id: string) => void;
};

export function ExplorerSelect({
  id,
  label,
  value,
  options,
  placeholder = "Select an option",
  emptyMessage = "No options available",
  disabled = false,
  loading = false,
  highlight = false,
  icon: Icon,
  onChange,
}: ExplorerSelectProps) {
  const listboxId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const selected = useMemo(
    () => options.find((option) => option.id === value) ?? null,
    [options, value],
  );

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return options;
    return options.filter(
      (option) =>
        option.label.toLowerCase().includes(needle) ||
        option.description?.toLowerCase().includes(needle),
    );
  }, [options, query]);

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
    if (!open) return;
    const frame = window.requestAnimationFrame(() => {
      searchRef.current?.focus();
    });
    return () => window.cancelAnimationFrame(frame);
  }, [open]);

  const isDisabled = disabled || loading;

  return (
    <div ref={rootRef} className="relative flex flex-col gap-[var(--space-2)]">
      <label
        htmlFor={id}
        className="text-[length:var(--text-sm)] font-medium text-foreground"
      >
        {label}
      </label>
      <button
        id={id}
        type="button"
        disabled={isDisabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listboxId}
        onClick={() => {
          if (isDisabled) return;
          setOpen((current) => !current);
        }}
        className={cx(
          "group flex h-12 w-full items-center gap-3 rounded-[var(--radius-xl)] border bg-surface px-3.5 text-left shadow-[0_10px_28px_-22px_rgba(10,10,10,0.45)] transition-[border-color,box-shadow,background-color]",
          highlight
            ? "border-primary ring-2 ring-primary/20"
            : "border-border hover:border-primary/40",
          open && "border-primary ring-2 ring-primary/15",
          isDisabled && "cursor-not-allowed opacity-60",
        )}
      >
        {Icon ? (
          <span
            className={cx(
              "flex h-8 w-8 shrink-0 items-center justify-center rounded-[var(--radius-lg)]",
              selected
                ? "bg-primary-soft text-primary"
                : "bg-secondary text-muted",
            )}
          >
            <Icon className="h-4 w-4" aria-hidden />
          </span>
        ) : null}
        <span className="min-w-0 flex-1">
          <Typography
            variant="body"
            className={cx(
              "truncate font-medium",
              selected ? "text-foreground" : "text-muted",
            )}
          >
            {loading
              ? "Loading…"
              : selected
                ? selected.label
                : placeholder}
          </Typography>
          {selected?.description ? (
            <Typography variant="caption" className="truncate text-muted">
              {selected.description}
            </Typography>
          ) : null}
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
        <div
          id={listboxId}
          role="listbox"
          className="absolute top-[calc(100%+0.5rem)] z-30 w-full overflow-hidden rounded-[var(--radius-xl)] border border-border bg-surface shadow-[0_24px_48px_-28px_rgba(10,10,10,0.4)]"
        >
          <div className="border-b border-border px-3 py-2.5">
            <div className="flex items-center gap-2 rounded-[var(--radius-lg)] bg-secondary px-3 py-2">
              <Search className="h-4 w-4 shrink-0 text-muted" aria-hidden />
              <input
                ref={searchRef}
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={`Search ${label.toLowerCase()}…`}
                className="w-full bg-transparent text-[length:var(--text-sm)] text-foreground outline-none placeholder:text-muted"
              />
            </div>
          </div>
          <ul className="max-h-64 overflow-y-auto p-1.5">
            {filtered.length === 0 ? (
              <li className="px-3 py-6 text-center">
                <Typography variant="body" className="text-muted">
                  {emptyMessage}
                </Typography>
              </li>
            ) : (
              filtered.map((option) => {
                const isActive = option.id === value;
                return (
                  <li key={option.id}>
                    <button
                      type="button"
                      role="option"
                      aria-selected={isActive}
                      className={cx(
                        "flex w-full items-center gap-3 rounded-[var(--radius-lg)] px-3 py-2.5 text-left transition-colors",
                        isActive
                          ? "bg-primary-soft text-primary"
                          : "text-foreground hover:bg-secondary",
                      )}
                      onClick={() => {
                        onChange(option.id);
                        setOpen(false);
                        setQuery("");
                      }}
                    >
                      <span className="min-w-0 flex-1">
                        <Typography
                          variant="body"
                          className="truncate font-medium"
                        >
                          {option.label}
                        </Typography>
                        {option.description ? (
                          <Typography
                            variant="caption"
                            className="truncate text-muted"
                          >
                            {option.description}
                          </Typography>
                        ) : null}
                      </span>
                      {isActive ? (
                        <Check className="h-4 w-4 shrink-0" aria-hidden />
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
