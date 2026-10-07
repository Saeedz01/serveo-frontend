import { Container } from "@/components/ui";
import { HeroCopy } from "./hero-copy";
import { HeroVisual } from "./hero-visual";

export function HomeHero() {
  return (
    <section className="relative flex min-h-[calc(100svh-3rem)] items-center overflow-hidden bg-background">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_20%,var(--primary-soft),transparent_42%),radial-gradient(circle_at_88%_12%,#f4f4f5,transparent_34%)]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-background to-transparent"
        aria-hidden
      />

      <Container className="relative grid w-full grid-cols-1 items-center gap-[var(--space-8)] py-[var(--space-8)] lg:grid-cols-2 lg:gap-[var(--space-7)] lg:py-[var(--space-9)]">
        <HeroCopy />
        <HeroVisual />
      </Container>
    </section>
  );
}
