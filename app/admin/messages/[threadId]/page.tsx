import { AdminChatRoom } from "./components/admin-chat-room";

export default async function AdminMessageThreadPage({
  params,
}: {
  params: Promise<{ threadId: string }>;
}) {
  const { threadId } = await params;
  return <AdminChatRoom threadId={threadId} />;
}
