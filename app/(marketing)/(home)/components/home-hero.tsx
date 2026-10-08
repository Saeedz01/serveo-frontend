import { Container } from "@/components/ui";
import { HeroCopy } from "./hero-copy";
import { HeroVisual } from "./hero-visual";

export function HomeHero() {
  return (
    <section className="relative flex min-h-[calc(100svh-3rem)] items-center overflow-hidden bg-secondary">
      <Container className="relative grid w-full grid-cols-1 items-center gap-[var(--space-8)] py-[var(--space-8)] lg:grid-cols-2 lg:gap-[var(--space-7)] lg:py-[var(--space-9)]">
        <HeroCopy />
        <HeroVisual />
      </Container>
    </section>
  );
}
