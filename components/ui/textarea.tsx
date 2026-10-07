import type { ComponentPropsWithoutRef } from "react";
import { cx } from "@/lib/cx";

type TextareaProps = ComponentPropsWithoutRef<"textarea"> & {
  invalid?: boolean;
};

export function Textarea({ className, invalid, ...props }: TextareaProps) {
  return (
    <textarea
      aria-invalid={invalid || undefined}
      className={cx(
        "min-h-28 w-full rounded-[var(--radius-md)] border bg-surface px-[var(--space-3)] py-[var(--space-3)] text-[length:var(--text-base)] text-foreground outline-none transition-colors placeholder:text-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-60",
        invalid
          ? "border-error focus:border-error focus-visible:outline-error"
          : "border-border focus:border-primary focus-visible:outline-primary",
        className,
      )}
      {...props}
    />
  );
}
