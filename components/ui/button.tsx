import type { ComponentPropsWithoutRef, ElementType, ReactNode } from "react";
import { cx } from "@/lib/cx";

const variants = {
  primary:
    "bg-primary text-primary-foreground hover:bg-[#5b21b6] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
  secondary:
    "border border-foreground bg-transparent text-foreground hover:bg-secondary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
  ghost:
    "bg-transparent text-foreground hover:bg-secondary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
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
