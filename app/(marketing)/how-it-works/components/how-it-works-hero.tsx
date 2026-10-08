import { Button, Container, Typography } from "@/components/ui";
import { HowItWorksHeroVisual } from "./how-it-works-hero-visual";

export function HowItWorksHero() {
  return (
    <section className="border-b border-border bg-primary text-primary-foreground">
      <Container className="grid items-center gap-[var(--space-8)] py-[var(--space-8)] lg:grid-cols-[0.9fr_1.1fr] lg:gap-[var(--space-7)] lg:py-[var(--space-9)]">
        <HowItWorksHeroVisual />

        <div className="max-w-xl lg:justify-self-end">
          <Typography
            variant="caption"
            className="mb-[var(--space-3)] block font-semibold tracking-[0.16em] text-primary-foreground/80 uppercase"
          >
            How it works
          </Typography>
          <Typography
            variant="h1"
            className="mb-[var(--space-4)] max-w-[18ch] text-primary-foreground"
          >
            Get home help from people near you
          </Typography>
          <Typography
            variant="bodyLarge"
            className="mb-[var(--space-6)] max-w-[42ch] text-primary-foreground/90"
          >
            Need assembly, moving, cleaning, or a small repair? Find a local
            provider, send a request, and see if they accept — without long
            phone calls or guessing.
          </Typography>
          <div className="flex flex-wrap gap-[var(--space-3)]">
            <Button
              as="a"
              href="/services"
              variant="inverse"
              className="rounded-[var(--radius-full)]"
            >
              Browse services
            </Button>
            <Button
              as="a"
              href="/provider/signup"
              variant="onPrimary"
              className="rounded-[var(--radius-full)]"
            >
              Become a provider
            </Button>
          </div>
        </div>
      </Container>
    </section>
  );
}
