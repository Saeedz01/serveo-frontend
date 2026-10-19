"use client";

import { useRef, useState } from "react";
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

function reverseGeocode(
  coords: { lat: number; lng: number },
  onResolved: (address: string) => void,
) {
  if (!window.google?.maps?.Geocoder) return;
  const geocoder = new window.google.maps.Geocoder();
  geocoder.geocode({ location: coords }, (results, status) => {
    if (status === "OK" && results?.[0]?.formatted_address) {
      onResolved(results[0].formatted_address);
    }
  });
}

export function SeekerLocationField({
  value,
  onChange,
  error,
}: SeekerLocationFieldProps) {
  const [geoError, setGeoError] = useState<string | null>(null);
  const [locating, setLocating] = useState(false);
  const valueRef = useRef(value);
  valueRef.current = value;

  const applyCoords = (lat: number, lng: number) => {
    const prev = valueRef.current;
    const keepTypedAddress =
      Boolean(prev.address.trim()) &&
      !prev.address.startsWith("Current location (");
    onChange({
      address: keepTypedAddress
        ? prev.address
        : `Current location (${lat.toFixed(4)}, ${lng.toFixed(4)})`,
      lat,
      lng,
    });
    reverseGeocode({ lat, lng }, (address) => {
      onChange({ address, lat, lng });
    });
  };

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      setGeoError("Location is not supported in this browser.");
      return;
    }

    setLocating(true);
    setGeoError(null);

    // Prefer a fast first fix (cached / network). High-accuracy GPS often times
    // out on the first click and forces the user to try again.
    navigator.geolocation.getCurrentPosition(
      (position) => {
        applyCoords(position.coords.latitude, position.coords.longitude);
        setLocating(false);

        // Refine with GPS in the background when available.
        navigator.geolocation.getCurrentPosition(
          (precise) => {
            applyCoords(precise.coords.latitude, precise.coords.longitude);
          },
          () => {
            /* keep the first fix */
          },
          { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 },
        );
      },
      (err) => {
        // Retry once with looser options if the first attempt fails.
        if (err.code === err.TIMEOUT || err.code === err.POSITION_UNAVAILABLE) {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              applyCoords(position.coords.latitude, position.coords.longitude);
              setLocating(false);
            },
            () => {
              setGeoError(
                "Could not read your location. Allow access or enter an address.",
              );
              setLocating(false);
            },
            { enableHighAccuracy: false, timeout: 20000, maximumAge: 300000 },
          );
          return;
        }
        setGeoError(
          err.code === err.PERMISSION_DENIED
            ? "Location permission denied. Allow access in your browser, or enter an address."
            : "Could not read your location. Allow access or enter an address.",
        );
        setLocating(false);
      },
      { enableHighAccuracy: false, timeout: 12000, maximumAge: 60000 },
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
