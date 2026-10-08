import { ProviderChatRoom } from "./components/provider-chat-room";

export default async function ProviderMessageThreadPage({
  params,
}: {
  params: Promise<{ threadId: string }>;
}) {
  const { threadId } = await params;
  return <ProviderChatRoom threadId={threadId} />;
}
