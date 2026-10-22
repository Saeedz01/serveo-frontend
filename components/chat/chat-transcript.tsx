"use client";

import { useEffect, useRef, useState } from "react";
import { Check, CheckCheck, Pencil, Trash2 } from "lucide-react";
import { Badge, Button, Textarea, Typography } from "@/components/ui";
import type { ChatActor } from "@/lib/chat/types";
import type { ChatMessage } from "@/lib/prototype-types";
import { participantKey } from "@/lib/prototype-chat";
import { cx } from "@/lib/cx";

type ChatTranscriptProps = {
  messages: ChatMessage[];
  me: ChatActor | null;
  contextServiceTitle?: string;
  peerIsAdmin?: boolean;
  adminName?: string;
  hasMore?: boolean;
  loadingOlder?: boolean;
  onLoadOlder?: () => void;
  onEdit?: (messageId: string, body: string) => Promise<void> | void;
  onDelete?: (messageId: string) => Promise<void> | void;
  typingLabel?: string | null;
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

function ReceiptTicks({ status }: { status: ChatMessage["status"] }) {
  if (status === "read") {
    return <CheckCheck className="h-3.5 w-3.5 text-sky-500" aria-label="Read" />;
  }
  if (status === "delivered") {
    return (
      <CheckCheck className="h-3.5 w-3.5 text-muted" aria-label="Delivered" />
    );
  }
  if (status === "sent" || status === "sending") {
    return <Check className="h-3.5 w-3.5 text-muted" aria-label="Sent" />;
  }
  return null;
}

export function ChatTranscript({
  messages,
  me,
  contextServiceTitle,
  peerIsAdmin = false,
  adminName,
  hasMore = false,
  loadingOlder = false,
  onLoadOlder,
  onEdit,
  onDelete,
  typingLabel,
}: ChatTranscriptProps) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const stickToBottomRef = useRef(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState("");

  useEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller || !stickToBottomRef.current) return;
    scroller.scrollTop = scroller.scrollHeight;
  }, [messages.length, typingLabel]);

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div
        ref={scrollerRef}
        className="flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain bg-secondary/40 px-[var(--space-4)] py-[var(--space-5)]"
        onScroll={(event) => {
          const el = event.currentTarget;
          const distance =
            el.scrollHeight - el.scrollTop - el.clientHeight;
          stickToBottomRef.current = distance < 80;
          if (el.scrollTop < 48 && hasMore && !loadingOlder) {
            onLoadOlder?.();
          }
        }}
      >
        {hasMore ? (
          <div className="mb-3 flex justify-center">
            <Button
              type="button"
              variant="ghost"
              className="h-8 min-h-8 text-[length:var(--text-xs)]"
              disabled={loadingOlder}
              onClick={() => onLoadOlder?.()}
            >
              {loadingOlder ? "Loading…" : "Load earlier messages"}
            </Button>
          </div>
        ) : null}

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
              const fromAdmin =
                !mine &&
                (message.sender.role === "admin" || peerIsAdmin);
              const deleted = Boolean(message.deletedAt);
              const editing = editingId === message.id;

              return (
                <li
                  key={message.id}
                  className={cx(
                    "flex max-w-[85%] flex-col gap-1",
                    mine ? "self-end items-end" : "self-start items-start",
                  )}
                >
                  {fromAdmin ? (
                    <span className="inline-flex items-center gap-1.5 px-0.5">
                      <Typography variant="caption" className="text-muted">
                        {adminName || "Serveo Admin"}
                      </Typography>
                      <Badge tone="primary" className="px-1.5 py-0">
                        Admin
                      </Badge>
                    </span>
                  ) : null}

                  {editing ? (
                    <div className="w-full min-w-[220px] space-y-2 rounded-[var(--radius-lg)] border border-border bg-surface p-3">
                      <Textarea
                        value={draft}
                        onChange={(event) => setDraft(event.target.value)}
                        rows={3}
                        className="min-h-[72px] resize-none"
                      />
                      <div className="flex justify-end gap-2">
                        <Button
                          type="button"
                          variant="ghost"
                          className="h-8 min-h-8"
                          onClick={() => setEditingId(null)}
                        >
                          Cancel
                        </Button>
                        <Button
                          type="button"
                          className="h-8 min-h-8"
                          disabled={!draft.trim()}
                          onClick={() => {
                            void Promise.resolve(
                              onEdit?.(message.id, draft.trim()),
                            ).then(() => setEditingId(null));
                          }}
                        >
                          Save
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div
                      className={cx(
                        "rounded-[var(--radius-lg)] px-[var(--space-4)] py-[var(--space-3)]",
                        mine
                          ? "bg-primary text-primary-foreground"
                          : "border border-border bg-surface text-foreground",
                        deleted && "italic opacity-70",
                      )}
                    >
                      {deleted ? (
                        <Typography
                          variant="body"
                          className={mine ? "text-primary-foreground" : undefined}
                        >
                          Message deleted
                        </Typography>
                      ) : (
                        <>
                          {message.body ? (
                            <Typography
                              variant="body"
                              className={
                                mine ? "text-primary-foreground" : undefined
                              }
                            >
                              {message.body}
                            </Typography>
                          ) : null}
                          {message.attachments && message.attachments.length > 0 ? (
                            <ul className="mt-2 space-y-2">
                              {message.attachments.map((file) => (
                                <li key={file.id}>
                                  {file.mimeType.startsWith("image/") ? (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img
                                      src={file.url}
                                      alt={file.name}
                                      className="max-h-48 max-w-full rounded-[var(--radius-md)] object-contain"
                                    />
                                  ) : (
                                    <a
                                      href={file.url}
                                      target="_blank"
                                      rel="noreferrer"
                                      className={cx(
                                        "underline",
                                        mine
                                          ? "text-primary-foreground"
                                          : "text-primary",
                                      )}
                                    >
                                      {file.name}
                                    </a>
                                  )}
                                </li>
                              ))}
                            </ul>
                          ) : null}
                        </>
                      )}
                    </div>
                  )}

                  <div className="flex items-center gap-2 px-0.5">
                    <Typography variant="caption" className="text-muted">
                      {formatTime(message.createdAt)}
                      {message.editedAt && !deleted ? " · Edited" : null}
                      {mine && message.status === "sending" ? " · Sending" : null}
                      {mine && message.status === "failed" ? " · Failed" : null}
                    </Typography>
                    {mine && !deleted ? <ReceiptTicks status={message.status} /> : null}
                    {mine && !deleted && !editing ? (
                      <span className="inline-flex gap-1">
                        <button
                          type="button"
                          className="text-muted hover:text-foreground"
                          aria-label="Edit message"
                          onClick={() => {
                            setEditingId(message.id);
                            setDraft(message.body);
                          }}
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          className="text-muted hover:text-error"
                          aria-label="Delete message"
                          onClick={() => {
                            void onDelete?.(message.id);
                          }}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </span>
                    ) : null}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
      {typingLabel ? (
        <Typography
          variant="caption"
          className="shrink-0 border-t border-border bg-secondary/40 px-[var(--space-4)] py-2 text-muted"
        >
          {typingLabel}
        </Typography>
      ) : null}
    </div>
  );
}
