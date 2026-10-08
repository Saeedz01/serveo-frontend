import { Button, PageHeader } from "@/components/ui";

export function DashboardPending({ name }: { name: string }) {
  return (
    <div className="space-y-[var(--space-4)]">
      <PageHeader
        tone="primary"
        eyebrow="Identity review"
        title={`Thanks, ${name}`}
        description="Your ID is under review. Prepare draft services now — publishing unlocks after an admin verifies you."
        actions={
          <>
            <Button
              as="a"
              href="/provider/services/new"
              variant="inverse"
              className="rounded-[var(--radius-full)]"
            >
              Create draft service
            </Button>
            <Button
              as="a"
              href="/provider/services"
              variant="onPrimary"
              className="rounded-[var(--radius-full)]"
            >
              View my drafts
            </Button>
          </>
        }
      />
    </div>
  );
}
