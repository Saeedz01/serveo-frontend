import { BookingRequestDetail } from "./components/booking-request-detail";

export default async function ProviderBookingDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ chat?: string }>;
}) {
  const { id } = await params;
  const query = await searchParams;
  const openChat = query.chat === "1" || query.chat === "true";

  return <BookingRequestDetail bookingId={id} openChatFromNotification={openChat} />;
}
