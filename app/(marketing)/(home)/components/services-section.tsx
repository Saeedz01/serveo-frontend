import { ServicesExplorer } from "@/components/services/services-explorer";

/** Provider results preview under the specialty grid */
const HOME_SERVICES_LIMIT = 8;

export function ServicesSection() {
  return (
    <section
      id="services"
      className="border-t border-border bg-background py-[var(--space-8)] sm:py-[var(--space-9)]"
    >
      <ServicesExplorer showHeading showViewAll limit={HOME_SERVICES_LIMIT} />
    </section>
  );
}
