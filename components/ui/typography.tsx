import type { ComponentPropsWithoutRef, ElementType, ReactNode } from "react";
import { cx } from "@/lib/cx";

const variants = {
  display:
    "font-[family-name:var(--font-display)] text-[length:var(--text-3xl)] sm:text-[length:var(--text-4xl)] lg:text-[length:var(--text-5xl)] font-semibold leading-[1.05] tracking-tight text-foreground",
  brand:
    "font-[family-name:var(--font-display)] text-[length:var(--text-2xl)] sm:text-[length:var(--text-3xl)] font-bold leading-none tracking-tight text-foreground",
  h1: "font-[family-name:var(--font-display)] text-[length:var(--text-2xl)] sm:text-[length:var(--text-3xl)] font-semibold leading-tight tracking-tight text-foreground",
  h2: "font-[family-name:var(--font-display)] text-[length:var(--text-xl)] sm:text-[length:var(--text-2xl)] font-semibold leading-snug tracking-tight text-foreground",
  h3: "font-[family-name:var(--font-display)] text-[length:var(--text-lg)] sm:text-[length:var(--text-xl)] font-semibold leading-snug text-foreground",
  h4: "text-[length:var(--text-base)] sm:text-[length:var(--text-lg)] font-semibold leading-snug text-foreground",
  body: "text-[length:var(--text-base)] leading-relaxed text-foreground",
  bodyLarge: "text-[length:var(--text-base)] sm:text-[length:var(--text-lg)] leading-relaxed text-muted",
  label: "text-[length:var(--text-sm)] font-medium leading-none text-foreground",
  caption: "text-[length:var(--text-xs)] leading-normal text-muted",
  nav: "text-[length:var(--text-sm)] font-medium leading-none text-foreground",
  button: "text-[length:var(--text-base)] font-medium leading-none",
  code: "font-mono text-[0.9em] rounded-[var(--radius-sm)] bg-secondary px-1.5 py-0.5",
} as const;

type TypographyVariant = keyof typeof variants;

const defaultElements: Record<TypographyVariant, ElementType> = {
  display: "h1",
  brand: "p",
  h1: "h1",
  h2: "h2",
  h3: "h3",
  h4: "h4",
  body: "p",
  bodyLarge: "p",
  label: "span",
  caption: "span",
  nav: "span",
  button: "span",
  code: "code",
};

type TypographyProps<T extends ElementType> = {
  as?: T;
  variant?: TypographyVariant;
  children: ReactNode;
  className?: string;
} & Omit<ComponentPropsWithoutRef<T>, "as" | "children" | "className">;

export function Typography<T extends ElementType = "p">({
  as,
  variant = "body",
  children,
  className,
  ...props
}: TypographyProps<T>) {
  const Component = as ?? defaultElements[variant];

  return (
    <Component className={cx(variants[variant], className)} {...props}>
      {children}
    </Component>
  );
}

export type { TypographyVariant };
