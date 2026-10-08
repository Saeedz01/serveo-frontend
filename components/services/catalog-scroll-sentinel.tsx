import type { RefObject } from "react";
import { Typography } from "@/components/ui";

type CatalogScrollSentinelProps = {
  hasMore: boolean;
  total: number;
  visible: number;
  sentinelRef: RefObject<HTMLDivElement | null>;
};

export function CatalogScrollSentinel({
  hasMore,
  total,
  visible,
  sentinelRef,
}: CatalogScrollSentinelProps) {
  if (total === 0) return null;

  return (
    <div
      ref={sentinelRef}
      className="flex min-h-10 items-center justify-center py-[var(--space-4)]"
      aria-live="polite"
    >
      {hasMore ? (
        <Typography variant="caption" className="text-muted">
          Loading more services…
        </Typography>
      ) : (
        <Typography variant="caption" className="text-muted">
          Showing all {visible} services
        </Typography>
      )}
    </div>
  );
}
