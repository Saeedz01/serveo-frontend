"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button, Typography } from "@/components/ui";
import { ChatComposer } from "./chat-composer";
import { ChatTranscript } from "./chat-transcript";
import { useChatThread } from "./use-chat-thread";

type ChatRoomProps = {
  threadId: string;
  basePath: string;
};

export function ChatRoom({ threadId, basePath }: ChatRoomProps) {
  const { thread, messages, peerName, send, actor } = useChatThread(threadId);

  if (!thread) {
    return (
      <div className="rounded-[var(--radius-xl)] border border-border bg-surface p-[var(--space-6)]">
        <Typography variant="h3" className="mb-[var(--space-2)]">
          Conversation not found
        </Typography>
        <Typography variant="body" className="mb-[var(--space-4)] text-muted">
          This thread may have been removed or you do not have access.
        </Typography>
        <Button as="a" href={basePath} variant="secondary">
          Back to messages
        </Button>
      </div>
    );
  }

  return (
    <div className="flex min-h-[70vh] flex-col overflow-hidden rounded-[var(--radius-xl)] border border-border bg-surface">
      <div className="flex items-center gap-[var(--space-3)] border-b border-border px-[var(--space-4)] py-[var(--space-3)]">
        <Link
          href={basePath}
          className="inline-flex h-9 w-9 items-center justify-center rounded-[var(--radius-md)] text-foreground hover:bg-secondary"
          aria-label="Back to inbox"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />
        </Link>
        <div className="min-w-0">
          <Typography variant="label" className="truncate">
            {peerName || "Conversation"}
          </Typography>
          {thread.contextServiceTitle ? (
            <Typography variant="caption" className="block truncate text-muted">
              {thread.contextServiceTitle}
            </Typography>
          ) : null}
        </div>
      </div>

      <ChatTranscript
        messages={messages}
        me={actor}
        contextServiceTitle={thread.contextServiceTitle}
      />
      <ChatComposer
        disabled={!actor}
        onSend={(body) => {
          send(body, thread.contextServiceId);
        }}
      />
    </div>
  );
}
