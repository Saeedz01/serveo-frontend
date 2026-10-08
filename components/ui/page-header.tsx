import type { ReactNode } from "react";
import { Typography } from "@/components/ui/typography";
import { cx } from "@/lib/cx";

type PageHeaderProps = {
  eyebrow?: string;
  title: string;
  description: string;
  actions?: ReactNode;
  tone?: "primary" | "surface";
  className?: string;
};

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
  tone = "surface",
  className,
}: PageHeaderProps) {
  const isPrimary = tone === "primary";

  return (
    <header
      className={cx(
        "flex flex-col gap-[var(--space-4)] rounded-[var(--radius-xl)] border p-[var(--space-6)] transition-shadow hover:shadow-[0_16px_36px_-28px_rgba(10,10,10,0.35)] sm:flex-row sm:items-end sm:justify-between",
        isPrimary
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border bg-surface",
        className,
      )}
    >
      <div className="min-w-0 max-w-2xl">
        {eyebrow ? (
          <Typography
            variant="caption"
            className={cx(
              "mb-2 block font-semibold tracking-wide uppercase",
              isPrimary ? "text-primary-foreground/80" : "text-primary",
            )}
          >
            {eyebrow}
          </Typography>
        ) : null}
        <Typography
          variant="h1"
          className={cx(
            "mb-[var(--space-2)]",
            isPrimary && "text-primary-foreground",
          )}
        >
          {title}
        </Typography>
        <Typography
          variant="bodyLarge"
          className={isPrimary ? "text-primary-foreground/90" : "text-muted"}
        >
          {description}
        </Typography>
      </div>
      {actions ? (
        <div className="flex flex-wrap items-center gap-[var(--space-3)]">
          {actions}
        </div>
      ) : null}
    </header>
  );
}
