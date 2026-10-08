import Image from "next/image";
import { Button, Container, Typography } from "@/components/ui";

export function ServicesHero() {
  return (
    <section className="relative overflow-hidden border-b border-border bg-primary text-primary-foreground">
      <Container className="relative grid items-center gap-[var(--space-7)] py-[var(--space-8)] lg:grid-cols-[1.05fr_0.95fr] lg:py-[var(--space-9)]">
        <div className="max-w-xl">
          <Typography
            variant="caption"
            className="mb-[var(--space-3)] block font-semibold tracking-[0.16em] text-primary-foreground/80 uppercase"
          >
            Serveo services
          </Typography>
          <Typography
            variant="h1"
            className="mb-[var(--space-4)] text-primary-foreground"
          >
            Find local help for home tasks
          </Typography>
          <Typography
            variant="bodyLarge"
            className="mb-[var(--space-6)] text-primary-foreground/90"
          >
            Browse cleaning, moving, assembly, repairs, and more. Pick a
            service, send a request, and track whether it was accepted.
          </Typography>
          <div className="flex flex-wrap gap-[var(--space-3)]">
            <Button
              as="a"
              href="#filtered-services"
              variant="inverse"
              className="rounded-[var(--radius-full)]"
            >
              Browse services
            </Button>
            <Button
              as="a"
              href="/how-it-works"
              variant="onPrimary"
              className="rounded-[var(--radius-full)]"
            >
              How it works
            </Button>
          </div>
        </div>

        <div className="relative mx-auto aspect-[4/3] w-full max-w-lg overflow-hidden rounded-[var(--radius-xl)] border border-primary-foreground/20 bg-primary-hover lg:mx-0 lg:max-w-none">
          <Image
            src="/marketing/services-hero.jpg"
            alt="Professional assembling furniture in a bright living room"
            fill
            priority
            className="object-cover object-[center_30%]"
            sizes="(max-width: 1024px) 100vw, 50vw"
          />
          <div className="absolute inset-x-0 bottom-0 bg-primary/90 px-[var(--space-5)] py-[var(--space-4)]">
            <Typography
              variant="label"
              className="mb-1 block text-primary-foreground"
            >
              Trusted local providers
            </Typography>
            <Typography
              variant="caption"
              className="block text-primary-foreground/80"
            >
              Request help in a few minutes — no long forms.
            </Typography>
          </div>
        </div>
      </Container>
    </section>
  );
}
