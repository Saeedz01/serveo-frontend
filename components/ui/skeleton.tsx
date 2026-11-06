import { cx } from "@/lib/cx";

type SkeletonProps = {
  className?: string;
};

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      aria-hidden
      className={cx(
        "animate-pulse rounded-[var(--radius-md)] bg-secondary",
        className,
      )}
    />
  );
}

/**
 * List-row placeholders. Keep page headers outside this component so static
 * chrome does not remount when data is loading.
 */
export function ProviderListSkeleton({
  rows = 4,
  showHeader = false,
}: {
  rows?: number;
  showHeader?: boolean;
}) {
  return (
    <div
      className="space-y-[var(--space-6)]"
      role="status"
      aria-live="polite"
      aria-label="Loading"
    >
      {showHeader ? (
        <div className="space-y-3">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-9 w-56 max-w-full" />
          <Skeleton className="h-4 w-full max-w-md" />
        </div>
      ) : null}

      <div className="overflow-hidden rounded-[var(--radius-xl)] border border-border bg-surface">
        <ul className="divide-y divide-border">
          {Array.from({ length: rows }).map((_, index) => (
            <li
              key={index}
              className="flex flex-col gap-3 px-[var(--space-4)] py-[var(--space-4)] sm:flex-row sm:items-center sm:justify-between sm:px-[var(--space-5)] sm:py-[var(--space-5)]"
            >
              <div className="min-w-0 flex-1 space-y-2.5">
                <div className="flex flex-wrap items-center gap-2">
                  <Skeleton className="h-5 w-40 max-w-[60%]" />
                  <Skeleton className="h-5 w-16 rounded-[var(--radius-full)]" />
                </div>
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-3.5 w-52 max-w-full" />
                <Skeleton className="h-3.5 w-36 max-w-full" />
              </div>
              <Skeleton className="h-4 w-14 shrink-0" />
            </li>
          ))}
        </ul>
      </div>
      <span className="sr-only">Loading…</span>
    </div>
  );
}
