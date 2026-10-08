"use client";

import { useState } from "react";
import { LocateFixed, MapPin } from "lucide-react";
import { LocationMapPicker } from "@/components/maps/location-map-picker";
import { Button, Input, Label, Typography } from "@/components/ui";
import { DEFAULT_MAP_CENTER } from "@/lib/maps/maps-config";
import type { BookingLocation } from "@/lib/prototype-types";

type SeekerLocationFieldProps = {
  value: BookingLocation;
  onChange: (location: BookingLocation) => void;
  error?: string;
};

export function SeekerLocationField({
  value,
  onChange,
  error,
}: SeekerLocationFieldProps) {
  const [geoError, setGeoError] = useState<string | null>(null);
  const [locating, setLocating] = useState(false);

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      setGeoError("Location is not supported in this browser.");
      return;
    }

    setLocating(true);
    setGeoError(null);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        onChange({
          address:
            value.address.trim() ||
            `Current location (${lat.toFixed(4)}, ${lng.toFixed(4)})`,
          lat,
          lng,
        });
        setLocating(false);
      },
      () => {
        setGeoError("Could not read your location. Allow access or enter an address.");
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  };

  return (
    <div className="space-y-[var(--space-3)]">
      <div>
        <Label htmlFor="seeker-location">Service location</Label>
        <div className="flex flex-col gap-[var(--space-2)] sm:flex-row">
          <div className="relative min-w-0 flex-1">
            <MapPin
              className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted"
              aria-hidden
            />
            <Input
              id="seeker-location"
              value={value.address}
              invalid={Boolean(error)}
              onChange={(event) =>
                onChange({
                  ...value,
                  address: event.target.value,
                  lat: value.lat || DEFAULT_MAP_CENTER.lat,
                  lng: value.lng || DEFAULT_MAP_CENTER.lng,
                })
              }
              placeholder="Street, neighborhood, or landmark"
              className="pl-9"
              autoComplete="street-address"
            />
          </div>
          <Button
            type="button"
            variant="secondary"
            className="h-11 min-h-11 shrink-0 px-3 text-[length:var(--text-sm)]"
            onClick={handleUseCurrentLocation}
            disabled={locating}
          >
            <LocateFixed className="h-4 w-4" aria-hidden />
            {locating ? "Locating..." : "Use my location"}
          </Button>
        </div>
        {error ? (
          <Typography variant="caption" className="mt-2 block text-error">
            {error}
          </Typography>
        ) : null}
        {geoError ? (
          <Typography variant="caption" className="mt-2 block text-error">
            {geoError}
          </Typography>
        ) : null}
      </div>

      <LocationMapPicker
        label="Pin on map"
        lat={value.lat || DEFAULT_MAP_CENTER.lat}
        lng={value.lng || DEFAULT_MAP_CENTER.lng}
        onChange={(coords) =>
          onChange({
            address: value.address,
            lat: coords.lat,
            lng: coords.lng,
          })
        }
        onAddressResolved={(address, coords) =>
          onChange({
            address,
            lat: coords.lat,
            lng: coords.lng,
          })
        }
      />
    </div>
  );
}
