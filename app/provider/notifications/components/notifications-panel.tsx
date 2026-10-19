"use client";

import { useMemo } from "react";
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
import {
  useGetMyNotificationsQuery,
  useMarkAllNotificationsReadMutation,
  useMarkNotificationReadMutation,
} from "@/service/api";
import { getAccessToken } from "@/service/splitApiSetting";

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

type UnifiedNotification = {
  id: string;
  title: string;
  body: string;
  href?: string | null;
  read: boolean;
  createdAt: string;
  source: "api" | "local";
};

export function NotificationsPanel() {
  const {
    ready,
    currentProvider,
    notificationsForProvider,
    markNotificationRead,
    markAllNotificationsRead,
  } = usePrototype();
  const hasToken = Boolean(getAccessToken());
  const { data: apiNotifications = [], isLoading } = useGetMyNotificationsQuery(
    undefined,
    { skip: !ready || !currentProvider || !hasToken, pollingInterval: 30_000 },
  );
  const [markApiRead] = useMarkNotificationReadMutation();
  const [markAllApiRead] = useMarkAllNotificationsReadMutation();

  const notifications = useMemo(() => {
    if (!currentProvider) return [] as UnifiedNotification[];

    const local = notificationsForProvider(currentProvider.id).map(
      (item): UnifiedNotification => ({
        id: item.id,
        title: item.title,
        body: item.body,
        href: item.href,
        read: item.read,
        createdAt: item.createdAt,
        source: "local",
      }),
    );

    const fromApi = apiNotifications.map(
      (item): UnifiedNotification => ({
        id: item.id,
        title: item.title,
        body: item.body,
        href: item.href,
        read: item.read,
        createdAt: item.createdAt,
        source: "api",
      }),
    );

    return [...fromApi, ...local].sort((a, b) =>
      b.createdAt.localeCompare(a.createdAt),
    );
  }, [apiNotifications, currentProvider, notificationsForProvider]);

  if (!ready || (hasToken && isLoading)) {
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

  const unreadCount = notifications.filter((item) => !item.read).length;

  const handleMarkAll = () => {
    markAllNotificationsRead();
    if (hasToken) {
      void markAllApiRead();
    }
  };

  const handleMarkOne = (item: UnifiedNotification) => {
    if (item.read) return;
    if (item.source === "api") {
      void markApiRead(item.id);
    } else {
      markNotificationRead(item.id);
    }
  };

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
              onClick={handleMarkAll}
            >
              Mark all as read
            </Button>
          ) : null
        }
      />

      {notifications.length === 0 ? (
        <EmptyState
          title="No notifications yet"
          description="When a seeker accepts your bid or sends a booking request, you’ll see it here."
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
              <li key={`${item.source}-${item.id}`}>
                {item.href ? (
                  <Link
                    href={item.href}
                    className={cx(
                      "block px-[var(--space-5)] py-[var(--space-4)] transition-colors hover:bg-secondary/50",
                      !item.read && "bg-primary-soft/30",
                    )}
                    onClick={() => {
                      handleMarkOne(item);
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
                      handleMarkOne(item);
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
