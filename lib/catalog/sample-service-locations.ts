/** Deterministic sample service areas for seeded / migrated catalog rows. */

export type SampleServiceLocation = {
  address: string;
  lat: number;
  lng: number;
};

const SAMPLES: SampleServiceLocation[] = [
  { address: "14 Mercer St, SoHo, New York", lat: 40.7215, lng: -74.0012 },
  { address: "88 Harbor Ave, Westside", lat: 40.735, lng: -74.02 },
  { address: "210 North Park Ave", lat: 40.75, lng: -73.99 },
  { address: "45 Garden Hills Rd", lat: 40.7, lng: -74.01 },
  { address: "120 Market St, Downtown", lat: 40.7128, lng: -74.006 },
  { address: "9 Riverside Dr, Midtown West", lat: 40.775, lng: -73.985 },
  { address: "330 Brooklyn Heights Blvd", lat: 40.696, lng: -73.993 },
  { address: "18 Queens Plaza, Long Island City", lat: 40.75, lng: -73.94 },
];

const PLACEHOLDER_ADDRESSES = new Set([
  "",
  "serveo marketplace",
  "address not provided",
]);

export function isPlaceholderServiceAddress(address: string | undefined) {
  return PLACEHOLDER_ADDRESSES.has((address ?? "").trim().toLowerCase());
}

export function sampleServiceLocation(seed: string): SampleServiceLocation {
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash + seed.charCodeAt(i) * (i + 1)) % SAMPLES.length;
  }
  return SAMPLES[hash] ?? SAMPLES[0];
}
