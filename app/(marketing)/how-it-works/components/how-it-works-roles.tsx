import { Container, Typography } from "@/components/ui";

const seekerPoints = [
  "Browse services without creating a long account first.",
  "Send a booking request with your phone and location.",
  "Message a provider about a service.",
  "Check My requests to see if it was accepted or declined.",
] as const;

const providerPoints = [
  "Sign up with your phone and ID details.",
  "Add the services you offer, with price and availability.",
  "Get booking requests and accept or decline them.",
  "Chat with seekers and with Serveo admin when needed.",
] as const;

export function HowItWorksRoles() {
  return (
    <section className="border-b border-border bg-background py-[var(--space-8)] sm:py-[var(--space-9)]">
      <Container>
        <div className="mb-[var(--space-7)] max-w-2xl">
          <Typography
            variant="caption"
            className="mb-[var(--space-3)] block font-semibold tracking-wide text-primary uppercase"
          >
            Who uses Serveo
          </Typography>
          <Typography variant="h2" className="mb-[var(--space-3)]">
            Two sides of the app
          </Typography>
          <Typography variant="bodyLarge">
            Seekers ask for help. Providers offer help. Admin reviews accounts
            and services.
          </Typography>
        </div>

        <div className="grid gap-[var(--space-6)] lg:grid-cols-2">
          <div className="border border-border bg-surface p-[var(--space-6)]">
            <Typography variant="h3" className="mb-[var(--space-4)]">
              If you need help
            </Typography>
            <ul className="space-y-[var(--space-3)]">
              {seekerPoints.map((point) => (
                <li key={point} className="flex gap-[var(--space-3)]">
                  <span
                    className="mt-2 h-2 w-2 shrink-0 rounded-full bg-primary"
                    aria-hidden
                  />
                  <Typography variant="body">{point}</Typography>
                </li>
              ))}
            </ul>
          </div>

          <div className="border border-border bg-surface p-[var(--space-6)]">
            <Typography variant="h3" className="mb-[var(--space-4)]">
              If you offer services
            </Typography>
            <ul className="space-y-[var(--space-3)]">
              {providerPoints.map((point) => (
                <li key={point} className="flex gap-[var(--space-3)]">
                  <span
                    className="mt-2 h-2 w-2 shrink-0 rounded-full bg-primary"
                    aria-hidden
                  />
                  <Typography variant="body">{point}</Typography>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Container>
    </section>
  );
}
