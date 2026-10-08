import { Button, Container, Typography } from "@/components/ui";

const steps = [
  {
    title: "Pick a service",
    description: "Choose the help you need from the services list.",
  },
  {
    title: "Send a request",
    description: "Share your name, phone, and location with the provider.",
  },
  {
    title: "Check the status",
    description: "See if your request was accepted or declined in My requests.",
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
            Serveo helps you find local people for home jobs. Here is the short
            version.
          </Typography>
        </div>

        <ol className="grid grid-cols-1 gap-[var(--space-5)] md:grid-cols-3">
          {steps.map((step, index) => (
            <li
              key={step.title}
              className="border-t-4 border-primary bg-surface px-[var(--space-5)] py-[var(--space-5)]"
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

        <div className="flex justify-center">
          <Button
            as="a"
            href="/how-it-works"
            variant="secondary"
            className="rounded-[var(--radius-full)]"
          >
            Read the full guide
          </Button>
        </div>
      </Container>
    </section>
  );
}
