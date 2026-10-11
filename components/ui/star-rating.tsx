import { Star } from "lucide-react";
import { cx } from "@/lib/cx";

type StarRatingProps = {
  value: number;
  max?: number;
  size?: "sm" | "md";
  className?: string;
  /** Interactive selection mode */
  onChange?: (value: number) => void;
  label?: string;
};

const sizeClass = {
  sm: "h-3.5 w-3.5",
  md: "h-5 w-5",
} as const;

export function StarRating({
  value,
  max = 5,
  size = "sm",
  className,
  onChange,
  label,
}: StarRatingProps) {
  const rounded = Math.round(value * 2) / 2;
  const interactive = typeof onChange === "function";

  return (
    <div
      className={cx("inline-flex items-center gap-0.5", className)}
      role={interactive ? "radiogroup" : "img"}
      aria-label={label ?? `${value.toFixed(1)} out of ${max} stars`}
    >
      {Array.from({ length: max }, (_, index) => {
        const starValue = index + 1;
        const filled = rounded >= starValue;
        const half = !filled && rounded >= starValue - 0.5;

        if (interactive) {
          return (
            <button
              key={starValue}
              type="button"
              role="radio"
              aria-checked={value === starValue}
              aria-label={`${starValue} star${starValue === 1 ? "" : "s"}`}
              className="rounded-sm p-0.5 text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              onClick={() => onChange(starValue)}
            >
              <Star
                className={cx(
                  sizeClass[size],
                  value >= starValue
                    ? "fill-primary text-primary"
                    : "text-border",
                )}
                aria-hidden
              />
            </button>
          );
        }

        return (
          <Star
            key={starValue}
            className={cx(
              sizeClass[size],
              filled || half ? "fill-primary text-primary" : "text-border",
            )}
            aria-hidden
          />
        );
      })}
    </div>
  );
}

type RatingSummaryProps = {
  average: number;
  count: number;
  size?: "sm" | "md";
  className?: string;
  emptyLabel?: string;
};

export function RatingSummary({
  average,
  count,
  size = "sm",
  className,
  emptyLabel = "No ratings yet",
}: RatingSummaryProps) {
  if (count <= 0) {
    return (
      <span className={cx("text-[length:var(--text-sm)] text-muted", className)}>
        {emptyLabel}
      </span>
    );
  }

  return (
    <span
      className={cx(
        "inline-flex items-center gap-1.5 text-[length:var(--text-sm)] text-foreground",
        className,
      )}
    >
      <StarRating value={average} size={size} />
      <span className="font-semibold tabular-nums">{average.toFixed(1)}</span>
      <span className="text-muted">({count})</span>
    </span>
  );
}
