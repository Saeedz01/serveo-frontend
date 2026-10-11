"use client";

import { JOB_BID_VISIBLE_MS } from "@/lib/prototype-jobs";
import { cx } from "@/lib/cx";

type BidCountdownBarProps = {
  remainingMs: number;
  className?: string;
};

export function BidCountdownBar({
  remainingMs,
  className,
}: BidCountdownBarProps) {
  const ratio = Math.max(0, Math.min(1, remainingMs / JOB_BID_VISIBLE_MS));
  const seconds = Math.ceil(remainingMs / 1000);

  return (
    <div className={cx("space-y-1", className)}>
      <div
        className="h-1.5 w-full overflow-hidden rounded-[var(--radius-full)] bg-border"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={JOB_BID_VISIBLE_MS / 1000}
        aria-valuenow={seconds}
        aria-label={`${seconds} seconds left to accept this bid`}
      >
        <div
          className="h-full bg-primary transition-[width] duration-100 ease-linear"
          style={{ width: `${ratio * 100}%` }}
        />
      </div>
      <p className="text-[length:var(--text-xs)] text-muted">
        {seconds}s left to accept
      </p>
    </div>
  );
}
