import type { ReactNode } from "react";
import { cx } from "@/lib/cx";

const tones = {
  neutral: "bg-secondary text-foreground",
  primary: "bg-primary-soft text-primary",
  success: "bg-emerald-50 text-success",
  warning: "bg-amber-50 text-warning",
  danger: "bg-red-50 text-error",
} as const;

type BadgeProps = {
  children: ReactNode;
  tone?: keyof typeof tones;
  className?: string;
};

export function Badge({ children, tone = "neutral", className }: BadgeProps) {
  return (
    <span
      className={cx(
        "inline-flex items-center rounded-[var(--radius-full)] px-[var(--space-3)] py-[var(--space-1)] text-[length:var(--text-xs)] font-medium",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
