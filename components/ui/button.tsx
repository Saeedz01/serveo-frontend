import type { ComponentPropsWithoutRef, ElementType, ReactNode } from "react";
import { cx } from "@/lib/cx";

const variants = {
  primary:
    "border border-transparent bg-primary text-primary-foreground hover:bg-primary-hover hover:text-primary-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
  secondary:
    "border border-foreground bg-transparent text-foreground hover:bg-secondary hover:text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
  ghost:
    "border border-transparent bg-transparent text-foreground hover:bg-secondary hover:text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
  /** Solid light button for use on primary (purple) surfaces. */
  inverse:
    "border border-transparent bg-surface text-primary hover:bg-primary-soft hover:text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-foreground",
  /** Outline button for use on primary (purple) surfaces. */
  onPrimary:
    "border border-primary-foreground/50 bg-transparent text-primary-foreground hover:bg-primary-hover hover:text-primary-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-foreground",
} as const;

type ButtonVariant = keyof typeof variants;

type ButtonProps<T extends ElementType = "button"> = {
  as?: T;
  variant?: ButtonVariant;
  children: ReactNode;
  className?: string;
} & Omit<ComponentPropsWithoutRef<T>, "as" | "children" | "className">;

export function Button<T extends ElementType = "button">({
  as,
  variant = "primary",
  children,
  className,
  ...props
}: ButtonProps<T>) {
  const Component = as ?? "button";

  return (
    <Component
      className={cx(
        "inline-flex min-h-11 items-center justify-center gap-2 rounded-[var(--radius-md)] px-5 text-[length:var(--text-base)] font-medium transition-colors",
        variants[variant],
        className,
      )}
      {...props}
    >
      {children}
    </Component>
  );
}
