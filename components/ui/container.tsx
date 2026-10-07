import type { ReactNode } from "react";
import { cx } from "@/lib/cx";

type ContainerProps = {
  children: ReactNode;
  className?: string;
};

export function Container({ children, className }: ContainerProps) {
  return (
    <div
      className={cx(
        "mx-auto w-full max-w-[var(--container-max)] px-[var(--space-4)] sm:px-[var(--space-6)]",
        className,
      )}
    >
      {children}
    </div>
  );
}
