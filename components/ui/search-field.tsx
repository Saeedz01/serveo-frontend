import { Search } from "lucide-react";
import type { ComponentPropsWithoutRef, FormEvent, KeyboardEvent } from "react";
import { cx } from "@/lib/cx";

type SearchFieldProps = Omit<ComponentPropsWithoutRef<"input">, "type"> & {
  wrapperClassName?: string;
  /** When set, searching is submit-driven (Enter or the Search button). */
  onSearch?: () => void;
  searchButtonLabel?: string;
};

export function SearchField({
  className,
  wrapperClassName,
  onSearch,
  searchButtonLabel = "Search",
  onKeyDown,
  ...props
}: SearchFieldProps) {
  const submitSearch = () => {
    onSearch?.();
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    onKeyDown?.(event);
    if (event.defaultPrevented || !onSearch) return;
    if (event.key === "Enter") {
      event.preventDefault();
      submitSearch();
    }
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    submitSearch();
  };

  const field = (
    <div
      className={cx(
        "flex w-full items-center gap-[var(--space-3)] rounded-[var(--radius-full)] border border-border bg-surface px-[var(--space-4)] shadow-[0_8px_24px_-18px_rgba(10,10,10,0.35)] focus-within:border-primary",
        onSearch && "pr-[var(--space-2)]",
        wrapperClassName,
      )}
    >
      <Search className="h-4 w-4 shrink-0 text-muted" aria-hidden />
      <input
        type="search"
        className={cx(
          "h-12 w-full bg-transparent text-[length:var(--text-base)] text-foreground outline-none placeholder:text-muted",
          className,
        )}
        onKeyDown={handleKeyDown}
        {...props}
      />
      {onSearch ? (
        <button
          type="submit"
          className="shrink-0 rounded-[var(--radius-full)] bg-primary px-[var(--space-4)] py-2 text-[length:var(--text-sm)] font-medium text-primary-foreground transition-colors hover:bg-primary-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          {searchButtonLabel}
        </button>
      ) : null}
    </div>
  );

  if (!onSearch) return field;

  return (
    <form onSubmit={handleSubmit} className="contents">
      {field}
    </form>
  );
}
