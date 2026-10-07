import { Typography, Container } from "@/components/ui";

const steps = [
  {
    title: "Tell us what you need",
    description: "Pick a service and share a few details about your project.",
  },
  {
    title: "Match with a pro",
    description: "We connect you with a vetted local provider you can trust.",
  },
  {
    title: "Get it done",
    description: "Book a time, track progress, and pay when the job is complete.",
  },
] as const;

export function HowItWorks() {
  return (
    <section
      id="how-it-works"
      className="border-t border-border bg-secondary/60 py-[var(--space-8)] sm:py-[var(--space-9)]"
    >
      <Container className="flex flex-col gap-[var(--space-7)]">
        <div className="mx-auto max-w-2xl text-center">
          <Typography variant="h2" className="mb-[var(--space-3)]">
            How it works
          </Typography>
          <Typography variant="bodyLarge">
            From request to done — a simple path for seekers and providers.
          </Typography>
        </div>

        <ol className="grid grid-cols-1 gap-[var(--space-5)] md:grid-cols-3">
          {steps.map((step, index) => (
            <li
              key={step.title}
              className="rounded-[var(--radius-xl)] border border-border bg-surface p-[var(--space-5)]"
            >
              <Typography
                variant="caption"
                className="mb-[var(--space-3)] inline-flex font-semibold tracking-wide text-primary"
              >
                Step {index + 1}
              </Typography>
              <Typography variant="h4" className="mb-[var(--space-2)]">
                {step.title}
              </Typography>
              <Typography variant="body" className="text-muted">
                {step.description}
              </Typography>
            </li>
          ))}
        </ol>
      </Container>
    </section>
  );
}
