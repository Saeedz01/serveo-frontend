"use client";

import { ChatRoom } from "@/components/chat/chat-room";

export function AdminChatRoom({ threadId }: { threadId: string }) {
  return <ChatRoom threadId={threadId} basePath="/admin/messages" />;
}
