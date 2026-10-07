import { Check } from "lucide-react";
import { Typography } from "@/components/ui";

export function BookingPreview() {
  return (
    <div className="animate-serveo-float-delayed w-52 rounded-[var(--radius-lg)] border border-border bg-surface p-[var(--space-4)] shadow-[0_14px_34px_-20px_rgba(10,10,10,0.4)]">
      <Typography variant="caption" className="mb-[var(--space-2)] block font-medium uppercase tracking-wide text-primary">
        Booking preview
      </Typography>
      <Typography variant="label" className="mb-[var(--space-3)] block">
        IKEA desk · Today 3:00 PM
      </Typography>
      <ul className="space-y-[var(--space-2)]">
        {["Provider matched", "Quote locked", "Ready to confirm"].map(
          (step, index) => (
            <li key={step} className="flex items-center gap-[var(--space-2)]">
              <span
                className={
                  index < 2
                    ? "flex h-5 w-5 items-center justify-center rounded-[var(--radius-full)] bg-primary text-primary-foreground"
                    : "flex h-5 w-5 items-center justify-center rounded-[var(--radius-full)] border border-primary text-primary"
                }
              >
                {index < 2 ? (
                  <Check className="h-3 w-3" aria-hidden />
                ) : (
                  <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                )}
              </span>
              <Typography variant="caption" className="text-foreground">
                {step}
              </Typography>
            </li>
          ),
        )}
      </ul>
    </div>
  );
}
