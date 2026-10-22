import { SeekerDashboard } from "./components/seeker-dashboard";

type SeekerDashboardPageProps = {
  searchParams: Promise<{ tab?: string; thread?: string }>;
};

function parseTab(tab?: string): "requests" | "jobs" | "messages" {
  if (tab === "jobs" || tab === "messages") return tab;
  return "requests";
}

export default async function SeekerDashboardPage({
  searchParams,
}: SeekerDashboardPageProps) {
  const { tab, thread } = await searchParams;
  return (
    <SeekerDashboard
      initialTab={parseTab(tab)}
      initialThreadId={thread?.trim() || null}
    />
  );
}
