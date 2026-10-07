import { ServicesExplorer } from "@/components/services/services-explorer";

export function ServicesCatalogSection() {
  return (
    <section className="bg-background py-[var(--space-8)] sm:py-[var(--space-9)]">
      <ServicesExplorer showHeading={false} showViewAll={false} />
    </section>
  );
}
