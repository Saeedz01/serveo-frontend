"use client";

import { AdminMessagesInbox } from "../../components/admin-messages-inbox";

export function AdminChatRoom({ threadId }: { threadId: string }) {
  return <AdminMessagesInbox threadId={threadId} />;
}
