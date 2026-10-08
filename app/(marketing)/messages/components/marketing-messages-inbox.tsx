"use client";

import { Container } from "@/components/ui";
import { ChatInbox } from "@/components/chat/chat-inbox";

export function MarketingMessagesInbox() {
  return (
    <Container className="py-[var(--space-6)] lg:py-[var(--space-8)]">
      <ChatInbox
        basePath="/messages"
        title="Your messages"
        description="Chat with providers about services you are interested in."
        emptyTitle="No messages yet"
        emptyDescription="Open a service and tap Message provider to start a conversation."
        requireActorMessage="Identify yourself from a service page to start messaging providers. Your conversations will appear here."
      />
    </Container>
  );
}
