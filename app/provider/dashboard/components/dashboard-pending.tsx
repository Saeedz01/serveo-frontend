import { Button, Typography } from "@/components/ui";

export function DashboardPending({ name }: { name: string }) {
  return (
    <div className="overflow-hidden rounded-[var(--radius-xl)] border border-border bg-surface shadow-[0_20px_50px_-36px_rgba(109,40,217,0.5)]">
      <div className="bg-[linear-gradient(135deg,var(--primary)_0%,#4c1d95_100%)] px-[var(--space-6)] py-[var(--space-6)] text-primary-foreground">
        <Typography variant="caption" className="mb-2 block text-primary-foreground/80">
          Identity review
        </Typography>
        <Typography variant="h2" className="mb-[var(--space-2)] text-primary-foreground">
          Thanks, {name}
        </Typography>
        <Typography variant="body" className="max-w-xl text-primary-foreground/90">
          Your ID is under review. You can prepare draft services now — publishing
          unlocks after an admin verifies you.
        </Typography>
      </div>
      <div className="flex flex-col gap-[var(--space-3)] px-[var(--space-6)] py-[var(--space-5)] sm:flex-row">
        <Button as="a" href="/provider/services/new" className="rounded-[var(--radius-full)]">
          Create draft service
        </Button>
        <Button as="a" href="/provider/services" variant="secondary" className="rounded-[var(--radius-full)]">
          View my drafts
        </Button>
      </div>
    </div>
  );
}
