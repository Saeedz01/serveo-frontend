import { Container, Typography } from "@/components/ui";

const steps = [
  {
    title: "Choose a service",
    description:
      "Open Services and pick the job you need, like cleaning or moving help.",
  },
  {
    title: "Send a request",
    description:
      "Sign in as a seeker, then choose when you need help and where the work should happen.",
  },
  {
    title: "Wait for a reply",
    description:
      "The provider can accept and confirm, decline, or message you to negotiate.",
  },
  {
    title: "Track the status",
    description:
      "Open your seeker dashboard to see status and messages for each request.",
  },
] as const;

export function HowItWorksSteps() {
  return (
    <section className="border-b border-border bg-secondary py-[var(--space-8)] sm:py-[var(--space-9)]">
      <Container>
        <div className="mb-[var(--space-7)] max-w-2xl">
          <Typography
            variant="caption"
            className="mb-[var(--space-3)] block font-semibold tracking-wide text-primary uppercase"
          >
            For people who need help
          </Typography>
          <Typography variant="h2" className="mb-[var(--space-3)]">
            Four simple steps
          </Typography>
          <Typography variant="bodyLarge">
            This is the usual path from finding a service to getting a response.
          </Typography>
        </div>

        <ol className="grid gap-[var(--space-5)] sm:grid-cols-2">
          {steps.map((step, index) => (
            <li
              key={step.title}
              className="border-t-4 border-primary bg-surface px-[var(--space-5)] py-[var(--space-5)]"
            >
              <Typography
                variant="caption"
                className="mb-[var(--space-3)] block font-semibold tracking-wide text-primary uppercase"
              >
                Step {index + 1}
              </Typography>
              <Typography variant="h3" className="mb-[var(--space-2)]">
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
