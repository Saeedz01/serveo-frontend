"use client";

import { useMemo } from "react";
import { GoogleMap, Marker, Polyline, useJsApiLoader } from "@react-google-maps/api";
import { Navigation, MapPin } from "lucide-react";
import { Typography } from "@/components/ui";
import { cx } from "@/lib/cx";
import {
  computeTripDistance,
  type LatLng,
} from "@/lib/maps/distance";
import { GOOGLE_MAPS_API_KEY } from "@/lib/maps/maps-config";

type TripRouteMapProps = {
  origin: LatLng & { label: string };
  destination: LatLng & { label: string };
  className?: string;
};

const mapContainerStyle = { width: "100%", height: "100%" };

const mapOptions: google.maps.MapOptions = {
  disableDefaultUI: false,
  zoomControl: true,
  mapTypeControl: false,
  streetViewControl: false,
  fullscreenControl: false,
  clickableIcons: false,
};

function MapPlaceholder({
  origin,
  destination,
  trip,
  className,
}: {
  origin: TripRouteMapProps["origin"];
  destination: TripRouteMapProps["destination"];
  trip: ReturnType<typeof computeTripDistance>;
  className?: string;
}) {
  return (
    <div
      className={cx(
        "relative overflow-hidden rounded-[var(--radius-xl)] border border-border bg-secondary",
        className,
      )}
    >
      <div className="absolute inset-0 opacity-[0.12]">
        <div className="absolute inset-x-0 top-1/3 border-t border-dashed border-foreground" />
        <div className="absolute inset-y-0 left-1/4 border-l border-dashed border-foreground" />
        <div className="absolute inset-y-0 left-2/3 border-l border-dashed border-foreground" />
        <div className="absolute inset-x-0 top-2/3 border-t border-dashed border-foreground" />
      </div>

      <div className="relative flex min-h-72 flex-col justify-between p-[var(--space-5)]">
        <div className="flex items-start justify-between gap-[var(--space-3)]">
          <div className="max-w-[55%] rounded-[var(--radius-lg)] border border-border bg-surface px-[var(--space-3)] py-[var(--space-2)] shadow-[0_10px_24px_-18px_rgba(10,10,10,0.4)]">
            <Typography
              variant="caption"
              className="mb-1 flex items-center gap-1.5 font-semibold text-primary"
            >
              <Navigation className="h-3.5 w-3.5" aria-hidden />
              Your base
            </Typography>
            <Typography variant="caption" className="text-foreground">
              {origin.label}
            </Typography>
          </div>
          <div className="rounded-[var(--radius-full)] bg-primary px-3 py-1.5 text-center text-primary-foreground">
            <Typography variant="label" className="block text-primary-foreground">
              {trip.distanceLabel}
            </Typography>
            <Typography
              variant="caption"
              className="block text-primary-foreground/85"
            >
              {trip.etaLabel}
            </Typography>
          </div>
        </div>

        <div className="mx-auto my-[var(--space-4)] h-16 w-px bg-primary/40" aria-hidden />

        <div className="ml-auto max-w-[55%] rounded-[var(--radius-lg)] border border-border bg-surface px-[var(--space-3)] py-[var(--space-2)] shadow-[0_10px_24px_-18px_rgba(10,10,10,0.4)]">
          <Typography
            variant="caption"
            className="mb-1 flex items-center gap-1.5 font-semibold text-primary"
          >
            <MapPin className="h-3.5 w-3.5" aria-hidden />
            Seeker job site
          </Typography>
          <Typography variant="caption" className="text-foreground">
            {destination.label}
          </Typography>
        </div>

        <Typography
          variant="caption"
          className="mt-[var(--space-4)] block text-center text-muted"
        >
          Live route map activates when Google Maps API key is set.
        </Typography>
      </div>
    </div>
  );
}

export function TripRouteMap({
  origin,
  destination,
  className,
}: TripRouteMapProps) {
  const trip = useMemo(
    () => computeTripDistance(origin, destination),
    [origin, destination],
  );

  const { isLoaded, loadError } = useJsApiLoader({
    id: "serveo-google-maps",
    googleMapsApiKey: GOOGLE_MAPS_API_KEY,
  });

  const path = useMemo(
    () => [
      { lat: origin.lat, lng: origin.lng },
      { lat: destination.lat, lng: destination.lng },
    ],
    [origin, destination],
  );

  const center = useMemo(
    () => ({
      lat: (origin.lat + destination.lat) / 2,
      lng: (origin.lng + destination.lng) / 2,
    }),
    [origin, destination],
  );

  if (!GOOGLE_MAPS_API_KEY.trim() || loadError) {
    return (
      <MapPlaceholder
        origin={origin}
        destination={destination}
        trip={trip}
        className={className}
      />
    );
  }

  return (
    <div className={cx("space-y-[var(--space-3)]", className)}>
      <div className="relative h-80 w-full overflow-hidden rounded-[var(--radius-xl)] border border-border">
        {!isLoaded ? (
          <div className="flex h-full items-center justify-center bg-secondary/40">
            <Typography variant="body" className="text-muted">
              Loading route map…
            </Typography>
          </div>
        ) : (
          <GoogleMap
            mapContainerStyle={mapContainerStyle}
            center={center}
            zoom={12}
            options={mapOptions}
          >
            <Marker position={{ lat: origin.lat, lng: origin.lng }} label="A" />
            <Marker
              position={{ lat: destination.lat, lng: destination.lng }}
              label="B"
            />
            <Polyline
              path={path}
              options={{
                strokeColor: "#5c3d91",
                strokeOpacity: 0.9,
                strokeWeight: 4,
              }}
            />
          </GoogleMap>
        )}
        <div className="absolute top-[var(--space-3)] right-[var(--space-3)] rounded-[var(--radius-full)] bg-primary px-3 py-1.5 text-primary-foreground shadow-[0_10px_24px_-12px_rgba(10,10,10,0.45)]">
          <Typography variant="label" className="block text-primary-foreground">
            {trip.distanceLabel}
          </Typography>
          <Typography
            variant="caption"
            className="block text-primary-foreground/85"
          >
            {trip.etaLabel} drive
          </Typography>
        </div>
      </div>
    </div>
  );
}
