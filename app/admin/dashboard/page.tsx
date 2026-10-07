import { Container } from "@/components/ui";
import { DashboardEmpty } from "./components/dashboard-empty";
import { DashboardHeader } from "./components/dashboard-header";

export default function AdminDashboardPage() {
  return (
    <Container className="flex flex-col gap-[var(--space-6)] py-[var(--space-6)]">
      <DashboardHeader />
      <DashboardEmpty />
    </Container>
  );
}
