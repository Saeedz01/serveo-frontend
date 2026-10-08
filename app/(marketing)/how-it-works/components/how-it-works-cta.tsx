import { Button, Container, Typography } from "@/components/ui";

export function HowItWorksCta() {
  return (
    <section className="bg-secondary py-[var(--space-8)] sm:py-[var(--space-9)]">
      <Container className="max-w-3xl text-center">
        <Typography variant="h2" className="mb-[var(--space-3)]">
          Ready to start?
        </Typography>
        <Typography variant="bodyLarge" className="mb-[var(--space-6)]">
          Look for a service, or create a provider account if you want to offer
          help.
        </Typography>
        <div className="flex flex-wrap justify-center gap-[var(--space-3)]">
          <Button as="a" href="/services" className="rounded-[var(--radius-full)]">
            Go to services
          </Button>
          <Button
            as="a"
            href="/requests"
            variant="secondary"
            className="rounded-[var(--radius-full)]"
          >
            Track my requests
          </Button>
        </div>
      </Container>
    </section>
  );
}
