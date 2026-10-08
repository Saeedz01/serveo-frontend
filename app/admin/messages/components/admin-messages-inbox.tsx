"use client";

import { ChatInbox } from "@/components/chat/chat-inbox";

export function AdminMessagesInbox() {
  return (
    <ChatInbox
      basePath="/admin/messages"
      eyebrow="Support"
      title="Provider messages"
      description="Message providers about marketplace listings and account issues."
      emptyTitle="No conversations yet"
      emptyDescription="Open a service and tap Message to start chatting with its provider."
    />
  );
}
