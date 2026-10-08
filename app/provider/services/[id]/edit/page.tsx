import { EditServiceForm } from "./components/edit-service-form";

export default async function EditServicePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <EditServiceForm serviceId={id} />;
}
