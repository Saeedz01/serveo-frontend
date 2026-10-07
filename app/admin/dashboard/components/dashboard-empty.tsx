import { Typography } from "@/components/ui";

export function DashboardEmpty() {
  return (
    <div className="rounded-[var(--radius-lg)] border border-border bg-surface p-[var(--space-6)]">
      <Typography variant="h3" className="mb-[var(--space-2)]">
        No activity yet
      </Typography>
      <Typography variant="body" className="text-muted">
        When you connect services and start using Serveo, status and recent
        activity will show up here.
      </Typography>
    </div>
  );
}
