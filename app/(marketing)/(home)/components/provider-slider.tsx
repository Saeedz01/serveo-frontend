"use client";

import { useEffect, useState } from "react";
import { Typography } from "@/components/ui";
import { providers } from "./marketplace-data";
import { ProviderCard } from "./provider-card";

export function ProviderSlider() {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % providers.length);
    }, 3800);

    return () => window.clearInterval(timer);
  }, []);

  const active = providers[activeIndex];

  return (
    <div className="w-full max-w-sm">
      <div key={active.id} className="animate-serveo-fade-up">
        <ProviderCard provider={active} featured />
      </div>

      <div
        className="mt-[var(--space-4)] flex items-center justify-between gap-[var(--space-3)]"
        role="tablist"
        aria-label="Featured providers"
      >
        <Typography variant="caption">
          Trusted pros near you · {activeIndex + 1}/{providers.length}
        </Typography>
        <div className="flex gap-[var(--space-2)]">
          {providers.map((provider, index) => (
            <button
              key={provider.id}
              type="button"
              role="tab"
              aria-selected={index === activeIndex}
              aria-label={`Show ${provider.name}`}
              onClick={() => setActiveIndex(index)}
              className={
                index === activeIndex
                  ? "h-2.5 w-6 rounded-[var(--radius-full)] bg-primary"
                  : "h-2.5 w-2.5 rounded-[var(--radius-full)] bg-primary-muted hover:bg-primary"
              }
            />
          ))}
        </div>
      </div>
    </div>
  );
}
