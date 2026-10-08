"use client";

import Link from "next/link";
import { Bell } from "lucide-react";
import {
  Button,
  EmptyState,
  PageHeader,
  Typography,
} from "@/components/ui";
import { usePrototype } from "@/components/prototype/prototype-provider";
import { cx } from "@/lib/cx";

function formatWhen(iso: string) {
  try {
    return new Intl.DateTimeFormat(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

export function NotificationsPanel() {
  const {
    ready,
    currentProvider,
    notificationsForProvider,
    markNotificationRead,
    markAllNotificationsRead,
  } = usePrototype();

  if (!ready) {
    return <Typography variant="body">Loading notifications...</Typography>;
  }

  if (!currentProvider) {
    return (
      <EmptyState
        title="Sign in required"
        description="Log in as a provider to see booking alerts and updates."
        action={
          <Button as="a" href="/provider/login">
            Provider login
          </Button>
        }
      />
    );
  }

  const notifications = notificationsForProvider(currentProvider.id);
  const unreadCount = notifications.filter((item) => !item.read).length;

  return (
    <div className="space-y-[var(--space-6)]">
      <PageHeader
        tone="primary"
        eyebrow="Inbox"
        title="Notifications"
        description={
          unreadCount > 0
            ? `You have ${unreadCount} unread update${unreadCount === 1 ? "" : "s"}.`
            : "You’re all caught up."
        }
        actions={
          unreadCount > 0 ? (
            <Button
              type="button"
              variant="inverse"
              className="rounded-[var(--radius-full)]"
              onClick={() => markAllNotificationsRead()}
            >
              Mark all as read
            </Button>
          ) : null
        }
      />

      {notifications.length === 0 ? (
        <EmptyState
          title="No notifications yet"
          description="When seekers request a booking, you’ll see it here."
          action={
            <Button as="a" href="/provider/services" variant="secondary">
              View services
            </Button>
          }
        />
      ) : (
        <ul className="overflow-hidden rounded-[var(--radius-xl)] border border-border bg-surface divide-y divide-border">
          {notifications.map((item) => {
            const content = (
              <div className="flex gap-[var(--space-3)]">
                <span
                  className={cx(
                    "mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full",
                    item.read
                      ? "bg-secondary text-muted"
                      : "bg-primary-soft text-primary",
                  )}
                >
                  <Bell className="h-4 w-4" aria-hidden />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="mb-1 flex flex-wrap items-center gap-2">
                    <Typography variant="label" className="block">
                      {item.title}
                    </Typography>
                    {!item.read ? (
                      <span className="rounded-full bg-primary px-2 py-0.5 text-[length:var(--text-xs)] font-semibold text-primary-foreground">
                        New
                      </span>
                    ) : null}
                  </div>
                  <Typography variant="body" className="text-muted">
                    {item.body}
                  </Typography>
                  <Typography variant="caption" className="mt-2 block text-muted">
                    {formatWhen(item.createdAt)}
                  </Typography>
                </div>
              </div>
            );

            return (
              <li key={item.id}>
                {item.href ? (
                  <Link
                    href={item.href}
                    className={cx(
                      "block px-[var(--space-5)] py-[var(--space-4)] transition-colors hover:bg-secondary/50",
                      !item.read && "bg-primary-soft/30",
                    )}
                    onClick={() => {
                      if (!item.read) markNotificationRead(item.id);
                    }}
                  >
                    {content}
                  </Link>
                ) : (
                  <button
                    type="button"
                    className={cx(
                      "w-full px-[var(--space-5)] py-[var(--space-4)] text-left transition-colors hover:bg-secondary/50",
                      !item.read && "bg-primary-soft/30",
                    )}
                    onClick={() => {
                      if (!item.read) markNotificationRead(item.id);
                    }}
                  >
                    {content}
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
