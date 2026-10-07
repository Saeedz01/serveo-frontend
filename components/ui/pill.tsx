import type { ComponentPropsWithoutRef, ElementType, ReactNode } from "react";
import { cx } from "@/lib/cx";

type PillProps<T extends ElementType = "button"> = {
  as?: T;
  children: ReactNode;
  className?: string;
  active?: boolean;
} & Omit<ComponentPropsWithoutRef<T>, "as" | "children" | "className">;

export function Pill<T extends ElementType = "button">({
  as,
  children,
  className,
  active = false,
  ...props
}: PillProps<T>) {
  const Component = as ?? "button";

  return (
    <Component
      className={cx(
        "inline-flex min-h-11 items-center justify-center rounded-[var(--radius-full)] border px-[var(--space-4)] py-[var(--space-2)] text-[length:var(--text-sm)] font-medium transition-colors",
        active
          ? "border-primary bg-primary-soft text-primary"
          : "border-border bg-surface text-foreground hover:border-primary hover:text-primary",
        className,
      )}
      {...props}
    >
      {children}
    </Component>
  );
}
