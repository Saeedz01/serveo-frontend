"use client";

import { Container, Typography } from "@/components/ui";
import { ChatInbox } from "@/components/chat/chat-inbox";
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
          Sign in or open My requests with the name and phone from your booking
          to view messages from the provider.
        </Typography>
        <a
          href="/seeker/dashboard?tab=messages"
          className="text-[length:var(--text-sm)] font-medium text-primary hover:underline"
        >
          Go to My requests
        </a>
      </Container>
    );
  }

  return (
    <Container className="py-[var(--space-6)] lg:py-[var(--space-8)]">
      <ChatInbox
        basePath="/messages"
        inboxPath="/seeker/dashboard?tab=messages"
        title="Your messages"
        description="Chat with providers about services you are interested in."
        emptyTitle="No messages yet"
        emptyDescription="Open a service and tap Message provider to start a conversation."
        activeThreadId={threadId}
        hrefForThread={(id) => `/seeker/dashboard?tab=messages&thread=${id}`}
      />
    </Container>
  );
}
