import type { ComponentPropsWithoutRef } from "react";
import { cx } from "@/lib/cx";

type SelectProps = ComponentPropsWithoutRef<"select"> & {
  invalid?: boolean;
};

export function Select({ className, children, invalid, ...props }: SelectProps) {
  return (
    <select
      aria-invalid={invalid || undefined}
      className={cx(
        "h-11 w-full rounded-[var(--radius-md)] border bg-surface px-[var(--space-3)] text-[length:var(--text-base)] text-foreground outline-none transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-60",
        invalid
          ? "border-error focus:border-error focus-visible:outline-error"
          : "border-border focus:border-primary focus-visible:outline-primary",
        className,
      )}
      {...props}
    >
      {children}
    </select>
  );
}
