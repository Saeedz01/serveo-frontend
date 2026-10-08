"use client";

import Link from "next/link";
import { Typography } from "@/components/ui";
import type { ThreadListItem } from "@/lib/chat/types";
import { cx } from "@/lib/cx";

type ChatThreadListProps = {
  threads: ThreadListItem[];
  basePath: string;
  activeThreadId?: string | null;
  emptyTitle?: string;
  emptyDescription?: string;
};

function formatPreviewTime(iso: string) {
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
    });
  } catch {
    return "";
  }
}

export function ChatThreadList({
  threads,
  basePath,
  activeThreadId,
  emptyTitle = "No conversations yet",
  emptyDescription = "Messages you start will show up here.",
}: ChatThreadListProps) {
  if (threads.length === 0) {
    return (
      <div className="rounded-[var(--radius-xl)] border border-border bg-surface px-[var(--space-5)] py-[var(--space-6)]">
        <Typography variant="h4" className="mb-[var(--space-2)]">
          {emptyTitle}
        </Typography>
        <Typography variant="body" className="text-muted">
          {emptyDescription}
        </Typography>
      </div>
    );
  }

  return (
    <ul className="overflow-hidden rounded-[var(--radius-xl)] border border-border bg-surface">
      {threads.map((thread) => {
        const active = thread.id === activeThreadId;
        return (
          <li key={thread.id} className="border-b border-border last:border-b-0">
            <Link
              href={`${basePath}/${thread.id}`}
              className={cx(
                "flex items-start gap-[var(--space-3)] px-[var(--space-4)] py-[var(--space-4)] transition-colors",
                active
                  ? "bg-primary-soft"
                  : "hover:bg-secondary",
              )}
            >
              <div className="min-w-0 flex-1">
                <div className="mb-1 flex items-center gap-[var(--space-2)]">
                  <Typography variant="label" className="truncate">
                    {thread.peerName}
                  </Typography>
                  {thread.unreadCount > 0 ? (
                    <span className="inline-flex min-h-5 min-w-5 items-center justify-center rounded-full bg-error px-1.5 text-[length:var(--text-xs)] font-semibold text-white">
                      {thread.unreadCount > 99 ? "99+" : thread.unreadCount}
                    </span>
                  ) : null}
                  <Typography
                    variant="caption"
                    className="ml-auto shrink-0 text-muted"
                  >
                    {formatPreviewTime(thread.lastMessageAt)}
                  </Typography>
                </div>
                {thread.contextServiceTitle ? (
                  <Typography
                    variant="caption"
                    className="mb-1 block truncate text-primary"
                  >
                    {thread.contextServiceTitle}
                  </Typography>
                ) : null}
                <Typography variant="body" className="truncate text-muted">
                  {thread.lastMessagePreview || "No messages yet"}
                </Typography>
              </div>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
