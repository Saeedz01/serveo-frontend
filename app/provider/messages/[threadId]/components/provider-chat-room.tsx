"use client";

import { ChatRoom } from "@/components/chat/chat-room";

export function ProviderChatRoom({ threadId }: { threadId: string }) {
  return <ChatRoom threadId={threadId} basePath="/provider/messages" />;
}
