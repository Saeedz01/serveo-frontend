"use client";

import { Container, Typography } from "@/components/ui";
import { ChatRoom } from "@/components/chat/chat-room";
import { usePrototype } from "@/components/prototype/prototype-provider";

export function MarketingChatRoom({ threadId }: { threadId: string }) {
  const { ready, currentSeeker } = usePrototype();

  if (!ready) {
    return (
      <Container className="py-[var(--space-8)]">
        <Typography variant="body">Loading conversation...</Typography>
      </Container>
    );
  }

  if (!currentSeeker) {
    return (
      <Container className="py-[var(--space-8)]">
        <Typography variant="h3" className="mb-[var(--space-2)]">
          Open My requests first
        </Typography>
        <Typography variant="body" className="mb-[var(--space-4)] text-muted">
          Enter the name and phone from your booking request to view messages
          from the provider. No account or login required.
        </Typography>
        <a
          href="/requests"
          className="text-[length:var(--text-sm)] font-medium text-primary hover:underline"
        >
          Go to My requests
        </a>
      </Container>
    );
  }

  return (
    <Container className="py-[var(--space-6)] lg:py-[var(--space-8)]">
      <ChatRoom
        threadId={threadId}
        basePath="/requests"
        backLabel="Back to My requests"
      />
    </Container>
  );
}
