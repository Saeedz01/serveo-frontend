import { parseSeekerTab } from "@/lib/seeker-dashboard-tab";
import { SeekerDashboard } from "./components/seeker-dashboard";

type SeekerDashboardPageProps = {
  searchParams: Promise<{ tab?: string; thread?: string }>;
};

export default async function SeekerDashboardPage({
  searchParams,
}: SeekerDashboardPageProps) {
  const { tab, thread } = await searchParams;
  return (
    <SeekerDashboard
      initialTab={parseSeekerTab(tab)}
      initialThreadId={thread?.trim() || null}
    />
  );
}
