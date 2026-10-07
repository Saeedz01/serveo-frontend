import { Search } from "lucide-react";
import type { ComponentPropsWithoutRef } from "react";
import { cx } from "@/lib/cx";

type SearchFieldProps = Omit<ComponentPropsWithoutRef<"input">, "type"> & {
  wrapperClassName?: string;
};

export function SearchField({
  className,
  wrapperClassName,
  ...props
}: SearchFieldProps) {
  return (
    <label
      className={cx(
        "flex w-full items-center gap-[var(--space-3)] rounded-[var(--radius-full)] border border-border bg-surface px-[var(--space-4)] shadow-[0_8px_24px_-18px_rgba(10,10,10,0.35)] focus-within:border-primary",
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
        {...props}
      />
    </label>
  );
}
