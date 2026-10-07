import { ServicesCatalogSection } from "./components/services-catalog-section";
import { ServicesHero } from "./components/services-hero";

export default function ServicesPage() {
  return (
    <>
      <ServicesHero />
      <ServicesCatalogSection />
    </>
  );
}
