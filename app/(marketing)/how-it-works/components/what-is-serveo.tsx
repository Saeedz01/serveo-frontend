import { Container, Typography } from "@/components/ui";

export function WhatIsServeo() {
  return (
    <section className="border-b border-border bg-background py-[var(--space-8)] sm:py-[var(--space-9)]">
      <Container className="max-w-3xl">
        <Typography
          variant="caption"
          className="mb-[var(--space-3)] block font-semibold tracking-wide text-primary uppercase"
        >
          What this app is
        </Typography>
        <Typography variant="h2" className="mb-[var(--space-4)]">
          A place to book local help for home work
        </Typography>
        <div className="space-y-[var(--space-4)]">
          <Typography variant="bodyLarge">
            Serveo connects people who need help at home with people who offer
            those services nearby.
          </Typography>
          <Typography variant="bodyLarge">
            You can find help for things like furniture assembly, moving,
            cleaning, yard work, small repairs, and painting.
          </Typography>
          <Typography variant="bodyLarge">
            You send a request with your contact details and location. The
            provider can accept or decline. You can also message them, and you
            can check the status of your request anytime.
          </Typography>
        </div>
      </Container>
    </section>
  );
}
