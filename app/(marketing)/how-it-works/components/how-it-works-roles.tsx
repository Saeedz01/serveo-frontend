import { Container, Typography } from "@/components/ui";

const seekerPoints = [
  "Browse and book as a guest, or create an account with phone and password.",
  "See the provider’s area and hours, then send when and where you need help.",
  "Track My requests with name + phone as a guest, or sign in to reopen them anytime.",
  "If a provider negotiates, read and reply to their messages from that request.",
] as const;

const providerPoints = [
  "Sign up with your phone and ID details.",
  "Add services with location, price, and availability.",
  "Accept and confirm requests, or negotiate in chat first.",
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
