import { HomeHero } from "./components/home-hero";
import { HowItWorks } from "./components/how-it-works";
import { ServicesSection } from "./components/services-section";

export default function HomePage() {
  return (
    <>
      <HomeHero />
      <ServicesSection />
      <HowItWorks />
    </>
  );
}
