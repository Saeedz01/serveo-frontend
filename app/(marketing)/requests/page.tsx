import { redirect } from "next/navigation";

type SeekerRequestsPageProps = {
  searchParams: Promise<{ tab?: string }>;
};

/** Legacy /requests URL → seeker dashboard. */
export default async function SeekerRequestsPage({
  searchParams,
}: SeekerRequestsPageProps) {
  const { tab } = await searchParams;
  if (tab === "jobs") {
    redirect("/seeker/dashboard?tab=jobs");
  }
  redirect("/seeker/dashboard?tab=requests");
}
