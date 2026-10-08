import type { ReactNode } from "react";
import { Typography } from "@/components/ui";

type AuthStageProps = {
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
  aside?: ReactNode;
};

export function AuthStage({
  eyebrow,
  title,
  description,
  children,
  aside,
}: AuthStageProps) {
  return (
    <div className="mx-auto grid w-full max-w-5xl overflow-hidden rounded-[var(--radius-xl)] border border-border bg-surface shadow-[0_28px_80px_-48px_rgba(10,10,10,0.45)] lg:grid-cols-[0.95fr_1.05fr]">
      <aside className="relative hidden overflow-hidden bg-primary p-[var(--space-7)] text-primary-foreground lg:flex lg:flex-col lg:justify-between">
        <div className="relative space-y-[var(--space-4)]">
          <Typography
            variant="caption"
            className="block font-semibold tracking-[0.16em] text-white/80 uppercase"
          >
            {eyebrow}
          </Typography>
          <Typography
            variant="h2"
            className="max-w-[12ch] text-balance text-white"
          >
            {title}
          </Typography>
          <Typography variant="body" className="max-w-[28ch] text-white/85">
            {description}
          </Typography>
        </div>
        {aside ? <div className="relative mt-[var(--space-8)]">{aside}</div> : null}
      </aside>

      <div className="flex flex-col justify-center p-[var(--space-5)] sm:p-[var(--space-6)] lg:p-[var(--space-7)]">
        {children}
      </div>
    </div>
  );
}
