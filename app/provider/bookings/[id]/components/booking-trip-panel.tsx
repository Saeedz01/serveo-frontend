import { Clock3, Navigation, Route } from "lucide-react";
import { Typography } from "@/components/ui";
import { TripRouteMap } from "@/components/maps/trip-route-map";
import {
  computeTripDistance,
  type LatLng,
} from "@/lib/maps/distance";

type BookingTripPanelProps = {
  origin: LatLng & { label: string };
  destination: LatLng & { label: string };
};

export function BookingTripPanel({
  origin,
  destination,
}: BookingTripPanelProps) {
  const trip = computeTripDistance(origin, destination);

  return (
    <section className="space-y-[var(--space-4)] rounded-[var(--radius-xl)] border border-border bg-surface p-[var(--space-5)]">
      <div>
        <Typography variant="h3" className="mb-[var(--space-2)]">
          Travel to job site
        </Typography>
        <Typography variant="body" className="text-muted">
          Like a ride request: see how far you travel from your service base to
          the seeker’s location before you accept.
        </Typography>
      </div>

      <div className="grid gap-[var(--space-3)] sm:grid-cols-3">
        <div className="rounded-[var(--radius-lg)] border border-border bg-secondary/40 px-[var(--space-4)] py-[var(--space-3)]">
          <Typography
            variant="caption"
            className="mb-1 flex items-center gap-1.5 font-semibold text-muted"
          >
            <Route className="h-3.5 w-3.5 text-primary" aria-hidden />
            Distance
          </Typography>
          <Typography variant="h3">{trip.distanceLabel}</Typography>
        </div>
        <div className="rounded-[var(--radius-lg)] border border-border bg-secondary/40 px-[var(--space-4)] py-[var(--space-3)]">
          <Typography
            variant="caption"
            className="mb-1 flex items-center gap-1.5 font-semibold text-muted"
          >
            <Clock3 className="h-3.5 w-3.5 text-primary" aria-hidden />
            Est. travel
          </Typography>
          <Typography variant="h3">{trip.etaLabel}</Typography>
        </div>
        <div className="rounded-[var(--radius-lg)] border border-border bg-secondary/40 px-[var(--space-4)] py-[var(--space-3)]">
          <Typography
            variant="caption"
            className="mb-1 flex items-center gap-1.5 font-semibold text-muted"
          >
            <Navigation className="h-3.5 w-3.5 text-primary" aria-hidden />
            From
          </Typography>
          <Typography variant="body" className="line-clamp-2">
            {origin.label}
          </Typography>
        </div>
      </div>

      <TripRouteMap origin={origin} destination={destination} />
    </section>
  );
}
