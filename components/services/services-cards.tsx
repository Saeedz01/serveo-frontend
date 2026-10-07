import { ServiceCard, Typography } from "@/components/ui";
import type { MarketplaceItem } from "@/lib/marketplace";

type ServicesCardsProps = {
  services: MarketplaceItem[];
  emptyMessage?: string;
};

export function ServicesCards({
  services,
  emptyMessage = "No services match your search. Try another category or keyword.",
}: ServicesCardsProps) {
  if (services.length === 0) {
    return (
      <div
        id="filtered-services"
        className="rounded-[var(--radius-xl)] border border-border bg-secondary/50 px-[var(--space-5)] py-[var(--space-7)] text-center"
      >
        <Typography variant="body" className="text-muted">
          {emptyMessage}
        </Typography>
      </div>
    );
  }

  return (
    <div
      id="filtered-services"
      className="grid grid-cols-1 gap-[var(--space-6)] sm:grid-cols-2 lg:grid-cols-4"
    >
      {services.map((service) => (
        <ServiceCard
          key={`${service.source}-${service.id}`}
          title={service.title}
          priceLabel={service.priceLabel}
          imageSrc={service.imageSrc}
          imageAlt={service.imageAlt}
          href={`/services/${service.id}`}
        />
      ))}
    </div>
  );
}
