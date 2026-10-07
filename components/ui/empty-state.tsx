import type { ReactNode } from "react";
import { Typography } from "@/components/ui/typography";
import { cx } from "@/lib/cx";

type EmptyStateProps = {
  title: string;
  description: string;
  action?: ReactNode;
  className?: string;
};

export function EmptyState({
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cx(
        "rounded-[var(--radius-xl)] border border-border bg-surface px-[var(--space-6)] py-[var(--space-7)] text-center",
        className,
      )}
    >
      <Typography variant="h3" className="mb-[var(--space-2)]">
        {title}
      </Typography>
      <Typography variant="body" className="mx-auto mb-[var(--space-5)] max-w-md text-muted">
        {description}
      </Typography>
      {action}
    </div>
  );
}
