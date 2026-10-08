"use client";

import { Container } from "@/components/ui";
import { ChatRoom } from "@/components/chat/chat-room";

export function MarketingChatRoom({ threadId }: { threadId: string }) {
  return (
    <Container className="py-[var(--space-6)] lg:py-[var(--space-8)]">
      <ChatRoom threadId={threadId} basePath="/messages" />
    </Container>
  );
}
