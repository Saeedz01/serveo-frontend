"use client";

import { ProviderMessagesInbox } from "../../components/provider-messages-inbox";

export function ProviderChatRoom({ threadId }: { threadId: string }) {
  return <ProviderMessagesInbox threadId={threadId} />;
}
