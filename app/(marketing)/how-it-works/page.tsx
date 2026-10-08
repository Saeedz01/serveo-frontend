import { HowItWorksCta } from "./components/how-it-works-cta";
import { HowItWorksHero } from "./components/how-it-works-hero";
import { HowItWorksRoles } from "./components/how-it-works-roles";
import { HowItWorksSteps } from "./components/how-it-works-steps";
import { WhatIsServeo } from "./components/what-is-serveo";

export default function HowItWorksPage() {
  return (
    <>
      <HowItWorksHero />
      <WhatIsServeo />
      <HowItWorksSteps />
      <HowItWorksRoles />
      <HowItWorksCta />
    </>
  );
}
