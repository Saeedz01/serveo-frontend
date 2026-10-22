"use client";

import type { ReactNode } from "react";
import { MessageSquare } from "lucide-react";
import { PageHeader, Typography } from "@/components/ui";
import { useChat } from "./chat-provider";
import { ChatThreadList } from "./chat-thread-list";

type ChatMessagesWorkspaceProps = {
  basePath: string;
  title: string;
  description: string;
  eyebrow?: string;
  emptyTitle?: string;
  emptyDescription?: string;
  requireActorMessage?: string;
  /** Currently open conversation — keeps the list visible beside the room. */
  activeThreadId?: string | null;
  /** Override thread links (e.g. seeker dashboard query params). */
  hrefForThread?: (threadId: string) => string;
  children?: ReactNode;
};

export function ChatMessagesWorkspace({
  basePath,
  title,
  description,
  eyebrow = "Messages",
  emptyTitle,
  emptyDescription,
  requireActorMessage,
  activeThreadId = null,
  hrefForThread,
  children,
}: ChatMessagesWorkspaceProps) {
  const { actor, threads } = useChat();

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-[var(--space-5)]">
      <div className="shrink-0">
        <PageHeader
          tone="primary"
          eyebrow={eyebrow}
          title={title}
          description={description}
        />
      </div>

      {!actor && requireActorMessage ? (
        <div className="rounded-[var(--radius-xl)] border border-border bg-surface px-[var(--space-5)] py-[var(--space-6)]">
          <Typography variant="body" className="text-muted">
            {requireActorMessage}
          </Typography>
        </div>
      ) : (
        <div className="grid h-[min(75vh,760px)] min-h-0 flex-1 overflow-hidden rounded-[var(--radius-xl)] border border-border bg-surface lg:grid-cols-[minmax(260px,320px)_minmax(0,1fr)]">
          {/* List scrolls on its own; never grows with the open thread. */}
          <aside className="flex max-h-[38vh] min-h-0 flex-col overflow-hidden border-b border-border lg:max-h-none lg:border-b-0 lg:border-r">
            <div className="shrink-0 border-b border-border px-[var(--space-4)] py-[var(--space-3)]">
              <Typography variant="label">Conversations</Typography>
              {threads.length > 0 ? (
                <Typography variant="caption" className="text-muted">
                  {threads.length} chat{threads.length === 1 ? "" : "s"}
                </Typography>
              ) : null}
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
              <ChatThreadList
                threads={threads}
                basePath={basePath}
                activeThreadId={activeThreadId}
                hrefForThread={hrefForThread}
                variant="panel"
                emptyTitle={emptyTitle}
                emptyDescription={emptyDescription}
              />
            </div>
          </aside>

          <section className="flex min-h-0 min-w-0 flex-col overflow-hidden">
            {activeThreadId && children ? (
              children
            ) : (
              <div className="m-auto flex max-w-sm flex-col items-center gap-[var(--space-3)] px-[var(--space-6)] py-[var(--space-10)] text-center">
                <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary-soft text-primary">
                  <MessageSquare className="h-5 w-5" aria-hidden />
                </span>
                <Typography variant="h4">Select a conversation</Typography>
                <Typography variant="body" className="text-muted">
                  Choose a chat from the list to read and reply. Your
                  conversations stay visible here while you message.
                </Typography>
              </div>
            )}
          </section>
        </div>
      )}
    </div>
  );
}
