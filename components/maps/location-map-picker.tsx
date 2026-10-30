"use client";

import { useCallback, useEffect, useMemo, useRef } from "react";
import {
  Circle,
  GoogleMap,
  Marker,
  useJsApiLoader,
} from "@react-google-maps/api";
import { Typography } from "@/components/ui";
import { cx } from "@/lib/cx";

type LocationMapPickerProps = {
  lat: number;
  lng: number;
  /** When omitted or 0, coverage radius circle is hidden (seeker pin mode). */
  radiusKm?: number;
  label?: string;
  onChange: (coords: { lat: number; lng: number }) => void;
  onAddressResolved?: (
    address: string,
    coords: { lat: number; lng: number },
  ) => void;
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

export function LocationMapPicker({
  lat,
  lng,
  radiusKm = 0,
  label = "Service location",
  onChange,
  onAddressResolved,
  className,
}: LocationMapPickerProps) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? "";
  const showRadius = radiusKm > 0;
  const mapRef = useRef<google.maps.Map | null>(null);

  const { isLoaded, loadError } = useJsApiLoader({
    id: "serveo-google-maps",
    googleMapsApiKey: apiKey,
  });

  const center = useMemo(() => ({ lat, lng }), [lat, lng]);
  const radiusMeters = Math.max(radiusKm, 1) * 1000;

  // GoogleMap only uses `center` on first mount — pan when coords change later
  // (e.g. "Use my location" on the first click).
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !Number.isFinite(lat) || !Number.isFinite(lng)) return;
    map.panTo({ lat, lng });
    const zoom = map.getZoom() ?? 12;
    if (zoom < 14) {
      map.setZoom(15);
    }
  }, [lat, lng]);

  const resolveAddress = useCallback(
    (coords: { lat: number; lng: number }) => {
      if (!onAddressResolved || !window.google?.maps?.Geocoder) return;
      const geocoder = new window.google.maps.Geocoder();
      geocoder.geocode({ location: coords }, (results, status) => {
        if (status === "OK" && results?.[0]?.formatted_address) {
          onAddressResolved(results[0].formatted_address, coords);
        }
      });
    },
    [onAddressResolved],
  );

  const handleMapClick = useCallback(
    (event: google.maps.MapMouseEvent) => {
      if (!event.latLng) return;
      const next = { lat: event.latLng.lat(), lng: event.latLng.lng() };
      onChange(next);
      resolveAddress(next);
    },
    [onChange, resolveAddress],
  );

  const handleMapLoad = useCallback(
    (map: google.maps.Map) => {
      mapRef.current = map;
      map.panTo({ lat, lng });
    },
    [lat, lng],
  );

  if (!apiKey) {
    return (
      <div className={cx("space-y-[var(--space-3)]", className)}>
        <Typography variant="label" className="block">
          {label}
        </Typography>
        <div className="flex h-64 items-center justify-center rounded-[var(--radius-xl)] border border-dashed border-border bg-secondary/50 px-[var(--space-5)] text-center">
          <Typography variant="body" className="text-muted">
            Map preview ready. Add{" "}
            <code className="text-foreground">NEXT_PUBLIC_GOOGLE_MAPS_API_KEY</code>{" "}
            to <code className="text-foreground">.env.local</code>, enable Maps
            JavaScript API, then restart the dev server.
          </Typography>
        </div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className={cx("space-y-[var(--space-3)]", className)}>
        <Typography variant="label" className="block">
          {label}
        </Typography>
        <div className="flex h-64 items-center justify-center rounded-[var(--radius-xl)] border border-error/30 bg-red-50 px-[var(--space-5)] text-center">
          <Typography variant="body" className="text-error">
            Google Maps failed to load. Check your API key and enabled Maps JavaScript API.
          </Typography>
        </div>
      </div>
    );
  }

  return (
    <div className={cx("space-y-[var(--space-3)]", className)}>
      <Typography variant="label" className="block">
        {label}
      </Typography>
      <div className="h-56 w-full overflow-hidden rounded-[var(--radius-xl)] border border-border shadow-[0_12px_30px_-22px_rgba(10,10,10,0.35)] sm:h-72">
        {!isLoaded ? (
          <div className="flex h-full items-center justify-center bg-secondary/40">
            <Typography variant="body" className="text-muted">
              Loading Google Map...
            </Typography>
          </div>
        ) : (
          <GoogleMap
            mapContainerStyle={mapContainerStyle}
            center={center}
            zoom={12}
            options={mapOptions}
            onLoad={handleMapLoad}
            onClick={handleMapClick}
          >
            <Marker position={center} />
            {showRadius ? (
              <Circle
                center={center}
                radius={radiusMeters}
                options={{
                  fillColor: "#5c3d91",
                  fillOpacity: 0.15,
                  strokeColor: "#5c3d91",
                  strokeOpacity: 0.7,
                  strokeWeight: 2,
                  clickable: false,
                }}
              />
            ) : null}
          </GoogleMap>
        )}
      </div>
      <Typography variant="caption" className="block text-muted">
        Click the map to set your pin · Lat {lat.toFixed(5)} · Lng {lng.toFixed(5)}
        {showRadius ? ` · Radius ${radiusKm} km` : ""}
      </Typography>
    </div>
  );
}
