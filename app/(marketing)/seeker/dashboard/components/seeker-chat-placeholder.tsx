"use client";

import { ChatInbox } from "@/components/chat/chat-inbox";
import { Button, EmptyState, Typography } from "@/components/ui";
import { useChat } from "@/components/chat/chat-provider";
import { getAccessToken } from "@/service/splitApiSetting";
import { getStoredAuthUser } from "@/service/auth-session";

const MESSAGES_INBOX = "/seeker/dashboard?tab=messages";

/**
 * Seeker dashboard Messages tab — list stays visible beside the open chat.
 */
export function SeekerChatPlaceholder({
  threadId = null,
}: {
  threadId?: string | null;
}) {
  const { actor } = useChat();
  const hasToken = Boolean(getAccessToken());
  const authUser = getStoredAuthUser();
  const accountSeeker = authUser?.role === "SEEKER" && hasToken;

  if (!accountSeeker) {
    return (
      <EmptyState
        title="Sign in to message providers"
        description="Log in as a seeker to chat about your bookings and service requests."
        action={
          <div className="flex flex-wrap justify-center gap-3">
            <Button as="a" href="/seeker/login">
              Seeker login
            </Button>
            <Button as="a" href="/seeker/signup" variant="secondary">
              Sign up
            </Button>
          </div>
        }
      />
    );
  }

  if (!actor) {
    return <Typography variant="body">Loading messages…</Typography>;
  }

  return (
    <ChatInbox
      basePath={MESSAGES_INBOX}
      inboxPath={MESSAGES_INBOX}
      title="Your messages"
      description="Chat with providers about your bookings and service requests."
      emptyTitle="No conversations yet"
      emptyDescription="When you or a provider start a chat on a booking, it will show up here."
      requireActorMessage="Sign in as a seeker to see your conversations."
      activeThreadId={threadId}
      hrefForThread={(id) => `${MESSAGES_INBOX}&thread=${id}`}
    />
  );
}
