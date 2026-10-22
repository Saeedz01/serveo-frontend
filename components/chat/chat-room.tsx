"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button, Typography } from "@/components/ui";
import { AdminPeerLabel } from "./admin-peer-label";
import { ChatComposer } from "./chat-composer";
import { ChatTranscript } from "./chat-transcript";
import { useChatThread } from "./use-chat-thread";
import { cx } from "@/lib/cx";

type ChatRoomProps = {
  threadId: string;
  basePath: string;
  backLabel?: string;
  /**
   * When true, room fills the workspace pane (no outer card chrome / full-page
   * back affordance is optional via showBackLink).
   */
  embedded?: boolean;
  showBackLink?: boolean;
};

export function ChatRoom({
  threadId,
  basePath,
  backLabel = "Back to messages",
  embedded = false,
  showBackLink,
}: ChatRoomProps) {
  const { thread, messages, peer, peerName, send, actor } =
    useChatThread(threadId);
  const backVisible = showBackLink ?? !embedded;

  if (!thread) {
    return (
      <div
        className={cx(
          "flex flex-1 flex-col justify-center p-[var(--space-6)]",
          !embedded &&
            "rounded-[var(--radius-xl)] border border-border bg-surface",
        )}
      >
        <Typography variant="h3" className="mb-[var(--space-2)]">
          Conversation not found
        </Typography>
        <Typography variant="body" className="mb-[var(--space-4)] text-muted">
          This thread may have been removed or you do not have access.
        </Typography>
        <Button as="a" href={basePath} variant="secondary">
          {backLabel}
        </Button>
      </div>
    );
  }

  return (
    <div
      className={cx(
        "flex h-full min-h-0 flex-1 flex-col overflow-hidden bg-surface",
        !embedded &&
          "min-h-[70vh] rounded-[var(--radius-xl)] border border-border",
      )}
    >
      <div className="flex shrink-0 items-center gap-[var(--space-3)] border-b border-border px-[var(--space-4)] py-[var(--space-3)]">
        {backVisible ? (
          <Link
            href={basePath}
            className="inline-flex h-9 w-9 items-center justify-center rounded-[var(--radius-md)] text-foreground hover:bg-secondary lg:hidden"
            aria-label={backLabel}
          >
            <ArrowLeft className="h-4 w-4" aria-hidden />
          </Link>
        ) : null}
        <div className="min-w-0">
          {peer?.role === "admin" ? (
            <AdminPeerLabel name={peerName || "Serveo Admin"} />
          ) : (
            <Typography variant="label" className="truncate">
              {peerName || "Conversation"}
            </Typography>
          )}
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
        peerIsAdmin={peer?.role === "admin"}
        adminName={peerName || undefined}
      />
      <ChatComposer
        disabled={!actor}
        onSend={(body) => {
          void send(body, thread.contextServiceId);
        }}
      />
    </div>
  );
}
