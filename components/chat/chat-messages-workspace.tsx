"use client";

import { useEffect, useState, type ReactNode } from "react";
import { MessageSquare } from "lucide-react";
import { PageHeader, SearchField, Typography } from "@/components/ui";
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
  activeThreadId?: string | null;
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
  const { actor, threads, transport } = useChat();
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (!actor || !transport.hydrate) return;
    const handle = window.setTimeout(() => {
      void transport.hydrate?.(actor, query).catch(() => undefined);
    }, 250);
    return () => window.clearTimeout(handle);
  }, [actor, query, transport]);

  return (
    <div className="flex flex-col gap-[var(--space-5)]">
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
        <div className="grid items-start rounded-[var(--radius-xl)] border border-border bg-surface lg:grid-cols-[minmax(220px,320px)_minmax(0,1fr)]">
          <aside
            className={`flex max-h-[min(70vh,720px)] flex-col overflow-hidden rounded-[var(--radius-xl)] border-border lg:sticky lg:top-[var(--space-4)] lg:max-h-[min(70vh,720px)] lg:self-start lg:rounded-l-[var(--radius-xl)] lg:rounded-tr-none lg:border-r ${
              activeThreadId
                ? "hidden border-b-0 lg:flex"
                : "border-b-0 lg:border-b-0"
            }`}
          >
            <div className="shrink-0 space-y-2 border-b border-border px-[var(--space-4)] py-[var(--space-3)]">
              <div>
                <Typography variant="label">Conversations</Typography>
                {threads.length > 0 ? (
                  <Typography variant="caption" className="text-muted">
                    {threads.length} chat{threads.length === 1 ? "" : "s"}
                  </Typography>
                ) : null}
              </div>
              <SearchField
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search chats…"
                aria-label="Search conversations"
              />
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
              <ChatThreadList
                threads={threads}
                basePath={basePath}
                activeThreadId={activeThreadId}
                hrefForThread={hrefForThread}
                variant="panel"
                emptyTitle={
                  query.trim()
                    ? "No matching conversations"
                    : emptyTitle
                }
                emptyDescription={
                  query.trim()
                    ? "Try a different name, service, or message preview."
                    : emptyDescription
                }
              />
            </div>
          </aside>

          <section
            className={`h-[min(70vh,720px)] min-w-0 flex-col overflow-hidden rounded-[var(--radius-xl)] lg:rounded-r-[var(--radius-xl)] lg:rounded-bl-none ${
              activeThreadId ? "flex" : "hidden lg:flex"
            }`}
          >
            {activeThreadId && children ? (
              children
            ) : (
              <div className="m-auto flex max-w-sm flex-col items-center gap-[var(--space-3)] px-[var(--space-4)] py-[var(--space-8)] text-center sm:px-[var(--space-6)] sm:py-[var(--space-10)]">
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
