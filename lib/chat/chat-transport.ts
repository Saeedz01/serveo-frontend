import type { ChatMessage, ChatThread } from "@/lib/prototype-types";
import type {
  ChatActor,
  ChatEvent,
  OpenThreadInput,
  SendMessageInput,
  ThreadListItem,
  Unsubscribe,
} from "./types";

/**
 * Swappable chat backend. LocalChatTransport implements this today;
 * a future WebSocketTransport can replace it without UI changes.
 */
export type ChatTransport = {
  listThreads: (me: ChatActor) => ThreadListItem[];
  getThread: (threadId: string) => ChatThread | undefined;
  listMessages: (threadId: string) => ChatMessage[];
  openThread: (input: OpenThreadInput) => ChatThread;
  sendMessage: (input: SendMessageInput) => ChatMessage;
  markRead: (threadId: string, me: ChatActor) => void;
  resolvePeerName: (peer: ChatActor) => string;
  unreadCount: (me: ChatActor) => number;
  subscribe: (listener: (event: ChatEvent) => void) => Unsubscribe;
};
