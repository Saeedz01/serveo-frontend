import type { ComponentPropsWithoutRef } from "react";
import { cx } from "@/lib/cx";

export function Label({
  className,
  ...props
}: ComponentPropsWithoutRef<"label">) {
  return (
    <label
      className={cx(
        "mb-[var(--space-2)] block text-[length:var(--text-sm)] font-medium text-foreground",
        className,
      )}
      {...props}
    />
  );
}
