import type {
  ChatAttachment,
  ChatMessage,
  ChatMessageStatus,
  ChatParticipant,
  ChatThread,
} from "@/lib/prototype-types";

export type ChatActor = ChatParticipant;

export type OpenThreadInput = {
  me: ChatActor;
  peer: ChatActor;
  serviceId?: string;
  serviceTitle?: string;
  /** Prefer booking-scoped threads when negotiating a request. */
  bookingId?: string;
};

export type SendMessageInput = {
  threadId: string;
  sender: ChatActor;
  body: string;
  attachments?: Omit<ChatAttachment, "id">[];
  serviceId?: string;
};

export type ChatEvent =
  | { type: "thread.upserted"; thread: ChatThread }
  | { type: "message.created"; message: ChatMessage }
  | { type: "message.updated"; message: ChatMessage }
  | {
      type: "message.status";
      messageId: string;
      threadId: string;
      status: ChatMessageStatus;
    }
  | {
      type: "thread.read";
      threadId: string;
      participantKey: string;
      lastReadAt: string;
    }
  | {
      type: "typing";
      threadId: string;
      participantKey: string;
      isTyping: boolean;
    };

export type Unsubscribe = () => void;

export type ThreadListItem = ChatThread & {
  peer: ChatActor;
  peerName: string;
  unreadCount: number;
};
