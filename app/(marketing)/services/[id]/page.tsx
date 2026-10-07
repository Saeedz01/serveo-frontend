import { ServiceDetailView } from "./components/service-detail-view";

type ServiceDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function ServiceDetailPage({
  params,
}: ServiceDetailPageProps) {
  const { id } = await params;
  return <ServiceDetailView serviceId={id} />;
}
