import { Check, Clock3, MapPin, MessageSquare } from "lucide-react";
import { Typography } from "@/components/ui";
import { cx } from "@/lib/cx";

export function HowItWorksHeroVisual({ className }: { className?: string }) {
  return (
    <div
      className={cx("relative mx-auto w-full max-w-sm lg:mx-0", className)}
      aria-hidden
    >
      <div className="absolute -left-3 top-8 h-24 w-24 rounded-[var(--radius-xl)] bg-primary-hover" />
      <div className="absolute -right-2 bottom-10 h-16 w-16 rounded-full bg-primary-soft/30" />

      <div className="relative space-y-[var(--space-3)]">
        <div className="animate-serveo-float rounded-[var(--radius-xl)] border border-primary-foreground/20 bg-surface p-[var(--space-4)] text-foreground shadow-[0_24px_50px_-28px_rgba(10,10,10,0.55)]">
          <div className="mb-[var(--space-3)] flex items-center gap-[var(--space-2)]">
            <span className="flex h-9 w-9 items-center justify-center rounded-[var(--radius-md)] bg-primary-soft text-primary">
              <MapPin className="h-4 w-4" />
            </span>
            <div className="min-w-0">
              <Typography variant="label" className="block truncate">
                Home cleaning
              </Typography>
              <Typography variant="caption" className="block text-muted">
                120 Market St · today
              </Typography>
            </div>
          </div>
          <div className="flex items-center justify-between rounded-[var(--radius-md)] bg-secondary px-[var(--space-3)] py-[var(--space-2)]">
            <Typography variant="caption" className="text-muted">
              Request status
            </Typography>
            <span className="inline-flex items-center gap-1 rounded-full bg-warning/15 px-2 py-0.5 text-[length:var(--text-xs)] font-semibold text-warning">
              <Clock3 className="h-3 w-3" />
              Pending
            </span>
          </div>
        </div>

        <div className="ml-[var(--space-5)] rounded-[var(--radius-xl)] border border-primary-foreground/25 bg-primary-hover p-[var(--space-4)] text-primary-foreground">
          <div className="mb-[var(--space-3)] flex items-center gap-[var(--space-2)]">
            <span className="flex h-9 w-9 items-center justify-center rounded-[var(--radius-md)] bg-surface text-primary">
              <Check className="h-4 w-4" />
            </span>
            <div className="min-w-0">
              <Typography
                variant="label"
                className="block truncate text-primary-foreground"
              >
                Same-day moving
              </Typography>
              <Typography
                variant="caption"
                className="block text-primary-foreground/75"
              >
                Accepted by Test Provider
              </Typography>
            </div>
          </div>
          <div className="flex items-center gap-[var(--space-2)] rounded-[var(--radius-md)] bg-primary px-[var(--space-3)] py-[var(--space-2)]">
            <MessageSquare className="h-3.5 w-3.5 shrink-0" />
            <Typography
              variant="caption"
              className="text-primary-foreground/90"
            >
              Provider can message you next
            </Typography>
          </div>
        </div>

        <div className="flex items-center gap-[var(--space-2)] px-1">
          {["Browse", "Request", "Track"].map((label, index) => (
            <div key={label} className="flex flex-1 flex-col items-center gap-1">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-surface text-[length:var(--text-sm)] font-semibold text-primary">
                {index + 1}
              </span>
              <Typography
                variant="caption"
                className="text-primary-foreground/80"
              >
                {label}
              </Typography>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
