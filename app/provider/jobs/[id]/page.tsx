import { ProviderJobDetail } from "./components/provider-job-detail";

type ProviderJobDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function ProviderJobDetailPage({
  params,
}: ProviderJobDetailPageProps) {
  const { id } = await params;
  return <ProviderJobDetail jobId={id} />;
}
