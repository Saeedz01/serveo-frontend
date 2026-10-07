import { Typography } from "@/components/ui";

export function DashboardHeader() {
  return (
    <div className="flex flex-col gap-[var(--space-2)]">
      <Typography variant="h1">Dashboard</Typography>
      <Typography variant="bodyLarge">
        Overview of your Serveo workspace. Add panels and metrics here.
      </Typography>
    </div>
  );
}
