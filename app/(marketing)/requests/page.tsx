import { SeekerRequestsPanel } from "./components/seeker-requests-panel";

type SeekerRequestsPageProps = {
  searchParams: Promise<{ tab?: string }>;
};

export default async function SeekerRequestsPage({
  searchParams,
}: SeekerRequestsPageProps) {
  const { tab } = await searchParams;
  return (
    <SeekerRequestsPanel initialTab={tab === "jobs" ? "jobs" : "bookings"} />
  );
}
