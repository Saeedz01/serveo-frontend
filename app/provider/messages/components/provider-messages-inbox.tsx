"use client";

import { ChatInbox } from "@/components/chat/chat-inbox";

export function ProviderMessagesInbox({
  threadId = null,
}: {
  threadId?: string | null;
}) {
  return (
    <ChatInbox
      basePath="/provider/messages"
      title="Messages"
      description="Chats with seekers and Serveo admins about your bookings and services."
      emptyTitle="No conversations yet"
      emptyDescription="When a seeker or admin messages you, it will show up here."
      activeThreadId={threadId}
    />
  );
}
