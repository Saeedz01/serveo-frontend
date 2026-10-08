"use client";

import { useEffect, useRef } from "react";
import { Typography } from "@/components/ui";
import type { ChatActor } from "@/lib/chat/types";
import type { ChatMessage } from "@/lib/prototype-types";
import { participantKey } from "@/lib/prototype-chat";
import { cx } from "@/lib/cx";

type ChatTranscriptProps = {
  messages: ChatMessage[];
  me: ChatActor | null;
  contextServiceTitle?: string;
};

function formatTime(iso: string) {
  try {
    return new Date(iso).toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

export function ChatTranscript({
  messages,
  me,
  contextServiceTitle,
}: ChatTranscriptProps) {
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  return (
    <div className="flex flex-1 flex-col overflow-y-auto bg-secondary/40 px-[var(--space-4)] py-[var(--space-5)]">
      {contextServiceTitle ? (
        <div className="mb-[var(--space-4)] rounded-[var(--radius-lg)] border border-border bg-surface px-[var(--space-4)] py-[var(--space-3)]">
          <Typography variant="caption" className="block text-muted">
            About this service
          </Typography>
          <Typography variant="label">{contextServiceTitle}</Typography>
        </div>
      ) : null}

      {messages.length === 0 ? (
        <Typography variant="body" className="m-auto text-center text-muted">
          No messages yet. Say hello to start the conversation.
        </Typography>
      ) : (
        <ul className="flex flex-col gap-[var(--space-3)]">
          {messages.map((message) => {
            const mine =
              me != null &&
              participantKey(message.sender) === participantKey(me);
            return (
              <li
                key={message.id}
                className={cx(
                  "flex max-w-[85%] flex-col gap-1",
                  mine ? "self-end items-end" : "self-start items-start",
                )}
              >
                <div
                  className={cx(
                    "rounded-[var(--radius-lg)] px-[var(--space-4)] py-[var(--space-3)]",
                    mine
                      ? "bg-primary text-primary-foreground"
                      : "border border-border bg-surface text-foreground",
                  )}
                >
                  <Typography
                    variant="body"
                    className={mine ? "text-primary-foreground" : undefined}
                  >
                    {message.body}
                  </Typography>
                </div>
                <Typography variant="caption" className="text-muted">
                  {formatTime(message.createdAt)}
                  {mine && message.status === "sending" ? " · Sending" : null}
                  {mine && message.status === "failed" ? " · Failed" : null}
                </Typography>
              </li>
            );
          })}
        </ul>
      )}
      <div ref={endRef} />
    </div>
  );
}
