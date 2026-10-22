"use client";

import { ChatInbox } from "@/components/chat/chat-inbox";

export function AdminMessagesInbox({
  threadId = null,
}: {
  threadId?: string | null;
}) {
  return (
    <ChatInbox
      basePath="/admin/messages"
      title="Provider messages"
      description="Message providers about marketplace services and moderation."
      emptyTitle="No conversations yet"
      emptyDescription="Start a chat from a service card to reach the provider."
      activeThreadId={threadId}
    />
  );
}
