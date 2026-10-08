"use client";

import { ChatInbox } from "@/components/chat/chat-inbox";

export function ProviderMessagesInbox() {
  return (
    <ChatInbox
      basePath="/provider/messages"
      eyebrow="Inbox"
      title="Messages"
      description="Chat with seekers and Serveo admin about your services."
      emptyTitle="No conversations yet"
      emptyDescription="When a seeker or admin messages you, it will show up here."
    />
  );
}
