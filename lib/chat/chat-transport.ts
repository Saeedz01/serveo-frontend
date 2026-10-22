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
 * Swappable chat backend.
 * LocalChatTransport = prototype/local; ApiChatTransport = Nest /messages.
 */
export type ChatTransport = {
  listThreads: (me: ChatActor) => ThreadListItem[];
  getThread: (threadId: string) => ChatThread | undefined;
  listMessages: (threadId: string) => ChatMessage[];
  openThread: (input: OpenThreadInput) => Promise<ChatThread>;
  sendMessage: (input: SendMessageInput) => Promise<ChatMessage>;
  markRead: (threadId: string, me: ChatActor) => void;
  resolvePeerName: (peer: ChatActor) => string;
  unreadCount: (me: ChatActor) => number;
  subscribe: (listener: (event: ChatEvent) => void) => Unsubscribe;
  /** Load threads (and optionally warm cache) from the server. */
  hydrate?: (me: ChatActor) => Promise<void>;
  /** Ensure messages for a thread are loaded into the cache. */
  hydrateThread?: (threadId: string) => Promise<void>;
  /** Track which thread is open so inbound messages do not inflate unread. */
  setActiveThread?: (threadId: string | null) => void;
};
