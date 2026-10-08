"use client";

import { PageHeader, Typography } from "@/components/ui";
import { useChat } from "./chat-provider";
import { ChatThreadList } from "./chat-thread-list";

type ChatInboxProps = {
  basePath: string;
  title: string;
  description: string;
  eyebrow?: string;
  emptyTitle?: string;
  emptyDescription?: string;
  requireActorMessage?: string;
};

export function ChatInbox({
  basePath,
  title,
  description,
  eyebrow = "Messages",
  emptyTitle,
  emptyDescription,
  requireActorMessage,
}: ChatInboxProps) {
  const { actor, threads } = useChat();

  return (
    <div className="space-y-[var(--space-6)]">
      <PageHeader
        tone="primary"
        eyebrow={eyebrow}
        title={title}
        description={description}
      />

      {!actor && requireActorMessage ? (
        <div className="rounded-[var(--radius-xl)] border border-border bg-surface px-[var(--space-5)] py-[var(--space-6)]">
          <Typography variant="body" className="text-muted">
            {requireActorMessage}
          </Typography>
        </div>
      ) : (
        <ChatThreadList
          threads={threads}
          basePath={basePath}
          emptyTitle={emptyTitle}
          emptyDescription={emptyDescription}
        />
      )}
    </div>
  );
}
