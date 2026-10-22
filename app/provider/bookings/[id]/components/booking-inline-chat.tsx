"use client";

import { X } from "lucide-react";
import { Button, Typography } from "@/components/ui";
import { ChatComposer } from "@/components/chat/chat-composer";
import { ChatTranscript } from "@/components/chat/chat-transcript";
import { useChatThread } from "@/components/chat/use-chat-thread";

type BookingInlineChatProps = {
  threadId: string;
  serviceTitle: string;
  seekerName: string;
  onClose: () => void;
};

export function BookingInlineChat({
  threadId,
  serviceTitle,
  seekerName,
  onClose,
}: BookingInlineChatProps) {
  const { thread, messages, peerName, send, actor } = useChatThread(threadId);

  return (
    <aside className="flex h-full min-h-0 flex-col overflow-hidden rounded-[var(--radius-xl)] border border-border bg-surface shadow-[0_24px_50px_-24px_rgba(10,10,10,0.45)]">
      <div className="flex shrink-0 items-start gap-[var(--space-3)] border-b border-border px-[var(--space-4)] py-[var(--space-3)]">
        <div className="min-w-0 flex-1">
          <Typography variant="label" className="truncate">
            Chat · {peerName || seekerName}
          </Typography>
          <Typography variant="caption" className="block truncate text-muted">
            About this request: {serviceTitle}
          </Typography>
        </div>
        <Button
          type="button"
          variant="ghost"
          className="h-8 min-h-8 w-8 shrink-0 px-0"
          aria-label="Close chat"
          onClick={onClose}
        >
          <X className="h-4 w-4" aria-hidden />
        </Button>
      </div>

      {!thread ? (
        <div className="flex flex-1 items-center justify-center p-[var(--space-5)]">
          <Typography variant="body" className="text-center text-muted">
            Conversation not found for this request.
          </Typography>
        </div>
      ) : (
        <>
          <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
            <ChatTranscript
              messages={messages}
              me={actor}
              contextServiceTitle={thread.contextServiceTitle}
            />
          </div>
          <div className="shrink-0">
            <ChatComposer
              disabled={!actor}
              onSend={(body) => {
                void send(body, thread.contextServiceId);
              }}
            />
          </div>
        </>
      )}
    </aside>
  );
}
