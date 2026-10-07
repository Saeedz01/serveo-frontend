import { BookingPreview } from "./booking-preview";
import { providers } from "./marketplace-data";
import { ProviderCard } from "./provider-card";
import { ProviderSlider } from "./provider-slider";

export function HeroVisual() {
  return (
    <div className="relative mx-auto flex w-full max-w-lg items-center justify-center lg:mx-0 lg:justify-end">
      <div
        className="absolute inset-8 rounded-[40%] bg-primary-soft blur-3xl"
        aria-hidden
      />
      <div
        className="animate-serveo-pulse-ring absolute right-10 top-8 h-40 w-40 rounded-full border border-primary/30"
        aria-hidden
      />

      <div className="relative flex w-full flex-col items-center gap-[var(--space-4)] lg:items-end">
        <div className="animate-serveo-float absolute -left-2 top-8 hidden md:block lg:-left-10">
          <ProviderCard provider={providers[1]} />
        </div>

        <ProviderSlider />

        <div className="absolute -bottom-4 right-0 hidden sm:block lg:-right-6">
          <BookingPreview />
        </div>
      </div>
    </div>
  );
}
