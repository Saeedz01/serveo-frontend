import { Clock3, MapPin } from "lucide-react";
import { Typography } from "@/components/ui";
import {
  enabledAvailabilitySlots,
  formatAvailabilityWindow,
} from "@/lib/prototype-availability";
import type { PrototypeService } from "@/lib/prototype-types";

type ServiceProviderCoverageProps = {
  service: PrototypeService;
  providerName?: string;
};

export function ServiceProviderCoverage({
  service,
  providerName,
}: ServiceProviderCoverageProps) {
  const slots = enabledAvailabilitySlots(service.availability);

  return (
    <div className="space-y-[var(--space-4)] rounded-[var(--radius-xl)] border border-border/80 bg-surface p-[var(--space-5)] shadow-[0_12px_40px_-30px_rgba(10,10,10,0.22)] sm:p-[var(--space-6)]">
      <div>
        <Typography variant="h4" className="mb-1 block tracking-tight">
          Coverage & hours
        </Typography>
        <Typography variant="caption" className="text-muted">
          {providerName
            ? `Where ${providerName} usually works and when they’re available.`
            : "Where this provider usually works and when they’re available."}
        </Typography>
      </div>

      <div className="flex items-start gap-[var(--space-3)]">
        <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
        <div>
          <Typography variant="caption" className="mb-1 block font-semibold text-foreground">
            Service location
          </Typography>
          <Typography variant="body" className="text-foreground">
            {service.address}
          </Typography>
          <Typography variant="caption" className="mt-1 block text-muted">
            Serves about {service.radiusKm} km around this area
          </Typography>
        </div>
      </div>

      <div className="flex items-start gap-[var(--space-3)]">
        <Clock3 className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
        <div className="min-w-0 flex-1">
          <Typography variant="caption" className="mb-2 block font-semibold text-foreground">
            Availability
          </Typography>
          {slots.length === 0 ? (
            <Typography variant="body" className="text-muted">
              Hours not listed yet.
            </Typography>
          ) : (
            <ul className="grid gap-1 sm:grid-cols-2">
              {slots.map((slot) => (
                <li key={`${slot.day}-${slot.start}-${slot.end}`}>
                  <Typography variant="caption" className="text-foreground">
                    {formatAvailabilityWindow(slot)}
                  </Typography>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
