import { MarketingChatRoom } from "./components/marketing-chat-room";

export default async function MessageThreadPage({
  params,
}: {
  params: Promise<{ threadId: string }>;
}) {
  const { threadId } = await params;
  return <MarketingChatRoom threadId={threadId} />;
}
