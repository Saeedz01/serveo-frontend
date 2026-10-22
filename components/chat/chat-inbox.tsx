"use client";

import { ChatMessagesWorkspace } from "./chat-messages-workspace";
import { ChatRoom } from "./chat-room";

type ChatInboxProps = {
  basePath: string;
  title: string;
  description: string;
  eyebrow?: string;
  emptyTitle?: string;
  emptyDescription?: string;
  requireActorMessage?: string;
  /** When set, list stays visible and this thread opens in the right pane. */
  activeThreadId?: string | null;
  hrefForThread?: (threadId: string) => string;
  /** Inbox home path used by the room back control (defaults to basePath). */
  inboxPath?: string;
};

/**
 * Messages surface: persistent conversation list + optional open chat.
 */
export function ChatInbox({
  basePath,
  title,
  description,
  eyebrow = "Messages",
  emptyTitle,
  emptyDescription,
  requireActorMessage,
  activeThreadId = null,
  hrefForThread,
  inboxPath,
}: ChatInboxProps) {
  const home = inboxPath ?? basePath;

  return (
    <ChatMessagesWorkspace
      basePath={basePath}
      title={title}
      description={description}
      eyebrow={eyebrow}
      emptyTitle={emptyTitle}
      emptyDescription={emptyDescription}
      requireActorMessage={requireActorMessage}
      activeThreadId={activeThreadId}
      hrefForThread={hrefForThread}
    >
      {activeThreadId ? (
        <ChatRoom
          threadId={activeThreadId}
          basePath={home}
          embedded
        />
      ) : null}
    </ChatMessagesWorkspace>
  );
}
