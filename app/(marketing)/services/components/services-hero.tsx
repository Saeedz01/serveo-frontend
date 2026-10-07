import { Container, Typography } from "@/components/ui";

export function ServicesHero() {
  return (
    <section className="relative flex min-h-[50svh] items-center overflow-hidden border-b border-border bg-background">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_12%_20%,var(--primary-soft),transparent_40%),radial-gradient(circle_at_90%_80%,#f4f4f5,transparent_36%)]"
        aria-hidden
      />
      <Container className="relative py-[var(--space-8)]">
        <Typography
          variant="caption"
          className="mb-[var(--space-3)] inline-flex font-semibold tracking-[0.14em] text-primary uppercase"
        >
          Services
        </Typography>
        <Typography variant="h1" className="mb-[var(--space-4)] max-w-[16ch]">
          All services in one place
        </Typography>
        <Typography variant="bodyLarge" className="max-w-[40ch]">
          Browse every Serveo category — filter by type or search for the exact
          help you need.
        </Typography>
      </Container>
    </section>
  );
}
