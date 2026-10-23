import {
  chatNotificationGroupKey,
  upsertNotificationByHref,
} from "./prototype-notifications";
import {
  displayNameForParticipant,
  makeThreadId,
  participantKey,
  snapshotParticipantNames,
} from "./prototype-chat-names";
import type {
  ChatMessage,
  ChatParticipant,
  ChatReadState,
  ChatThread,
  PrototypeState,
} from "./prototype-types";

export {
  displayNameForParticipant,
  makeThreadId,
  participantKey,
  resolveParticipantName,
} from "./prototype-chat-names";

export { clearCurrentSeeker } from "./prototype-seeker-auth";

function createId(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 9)}`;
}

export function openChatThread(
  state: PrototypeState,
  input: {
    me: ChatParticipant;
    peer: ChatParticipant;
    serviceId?: string;
    serviceTitle?: string;
    bookingId?: string;
  },
): { state: PrototypeState; thread: ChatThread } {
  const id = makeThreadId(input.me, input.peer);
  const existing = (state.chatThreads ?? []).find((thread) => thread.id === id);
  const now = new Date().toISOString();
  const participantNames = snapshotParticipantNames(
    state,
    [input.me, input.peer],
    existing?.participantNames,
  );

  if (existing) {
    const thread: ChatThread = {
      ...existing,
      participantNames,
      contextServiceId: input.serviceId ?? existing.contextServiceId,
      contextServiceTitle: input.serviceTitle ?? existing.contextServiceTitle,
      contextBookingId: input.bookingId ?? existing.contextBookingId,
    };
    return {
      thread,
      state: {
        ...state,
        chatThreads: (state.chatThreads ?? []).map((item) =>
          item.id === id ? thread : item,
        ),
      },
    };
  }

  const thread: ChatThread = {
    id,
    participants: [input.me, input.peer],
    participantNames,
    contextServiceId: input.serviceId,
    contextServiceTitle: input.serviceTitle,
    contextBookingId: input.bookingId,
    lastMessageAt: now,
    lastMessagePreview: "",
    createdAt: now,
  };

  return {
    thread,
    state: {
      ...state,
      chatThreads: [thread, ...(state.chatThreads ?? [])],
    },
  };
}

export function appendChatMessage(
  state: PrototypeState,
  input: {
    threadId: string;
    sender: ChatParticipant;
    body: string;
    serviceId?: string;
    status?: ChatMessage["status"];
    id?: string;
  },
): { state: PrototypeState; message: ChatMessage } {
  const body = input.body.trim();
  const now = new Date().toISOString();
  const message: ChatMessage = {
    id: input.id ?? createId("msg"),
    threadId: input.threadId,
    sender: input.sender,
    body,
    createdAt: now,
    status: input.status ?? "sent",
    serviceId: input.serviceId,
  };

  let next: PrototypeState = {
    ...state,
    chatMessages: [message, ...(state.chatMessages ?? [])],
    chatThreads: (state.chatThreads ?? []).map((thread) => {
      if (thread.id !== input.threadId) return thread;
      return {
        ...thread,
        lastMessageAt: now,
        lastMessagePreview: body.slice(0, 120),
        contextServiceId: input.serviceId ?? thread.contextServiceId,
        participantNames: snapshotParticipantNames(
          state,
          thread.participants,
          thread.participantNames,
        ),
      };
    }),
  };

  const thread = next.chatThreads.find((item) => item.id === input.threadId);
  const providerPeer = thread?.participants.find(
    (participant) =>
      participant.role === "provider" &&
      participantKey(participant) !== participantKey(input.sender),
  );

  if (providerPeer && input.sender.role !== "provider") {
    const senderName = displayNameForParticipant(next, input.sender, thread);
    const bookingHref = thread?.contextBookingId
      ? `/provider/bookings/${thread.contextBookingId}?chat=1`
      : `/provider/bookings`;
    next = upsertNotificationByHref(next, {
      providerId: providerPeer.id,
      type: "chat_message",
      title: senderName,
      body: body.slice(0, 120),
      href: bookingHref,
      groupKey: chatNotificationGroupKey(input.threadId),
    });
  }

  return { state: next, message };
}

export function updateChatMessageStatus(
  state: PrototypeState,
  messageId: string,
  status: ChatMessage["status"],
): PrototypeState {
  return {
    ...state,
    chatMessages: (state.chatMessages ?? []).map((message) =>
      message.id === messageId ? { ...message, status } : message,
    ),
  };
}

export function markThreadRead(
  state: PrototypeState,
  threadId: string,
  me: ChatParticipant,
): PrototypeState {
  const key = participantKey(me);
  const now = new Date().toISOString();
  const existing = (state.chatReadStates ?? []).find(
    (item) => item.threadId === threadId && item.participantKey === key,
  );

  const readState: ChatReadState = {
    threadId,
    participantKey: key,
    lastReadAt: now,
  };

  return {
    ...state,
    chatReadStates: existing
      ? (state.chatReadStates ?? []).map((item) =>
          item.threadId === threadId && item.participantKey === key
            ? readState
            : item,
        )
      : [readState, ...(state.chatReadStates ?? [])],
  };
}

export function threadsForParticipant(
  state: PrototypeState,
  me: ChatParticipant,
): ChatThread[] {
  const key = participantKey(me);
  return (state.chatThreads ?? [])
    .filter((thread) =>
      thread.participants.some((item) => participantKey(item) === key),
    )
    .slice()
    .sort((a, b) => b.lastMessageAt.localeCompare(a.lastMessageAt));
}

export function messagesForThread(
  state: PrototypeState,
  threadId: string,
): ChatMessage[] {
  return (state.chatMessages ?? [])
    .filter((message) => message.threadId === threadId)
    .slice()
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
}

export function unreadCountForThread(
  state: PrototypeState,
  threadId: string,
  me: ChatParticipant,
): number {
  const key = participantKey(me);
  const lastReadAt =
    (state.chatReadStates ?? []).find(
      (item) => item.threadId === threadId && item.participantKey === key,
    )?.lastReadAt ?? "";

  return (state.chatMessages ?? []).filter(
    (message) =>
      message.threadId === threadId &&
      participantKey(message.sender) !== key &&
      message.createdAt > lastReadAt,
  ).length;
}

/** Negotiation thread for a booking — seekers open this from My requests. */
export function findThreadForBooking(
  state: PrototypeState,
  booking: {
    id: string;
    seekerId?: string;
    providerId: string;
  },
): ChatThread | undefined {
  const byBooking = (state.chatThreads ?? []).find(
    (thread) => thread.contextBookingId === booking.id,
  );
  if (byBooking) return byBooking;

  if (!booking.seekerId) return undefined;
  const seekerKey = participantKey({ role: "seeker", id: booking.seekerId });
  const providerKey = participantKey({
    role: "provider",
    id: booking.providerId,
  });

  return (state.chatThreads ?? []).find((thread) => {
    const keys = thread.participants.map((item) => participantKey(item));
    return keys.includes(seekerKey) && keys.includes(providerKey);
  });
}

export function unreadMessagesForBooking(
  state: PrototypeState,
  booking: {
    id: string;
    seekerId?: string;
    providerId: string;
  },
  providerId: string,
): number {
  const thread = findThreadForBooking(state, booking);
  if (!thread) return 0;
  return unreadCountForThread(state, thread.id, {
    role: "provider",
    id: providerId,
  });
}

/** Unread seeker messages tied to this provider’s bookings (for Bookings tab badge). */
export function unreadBookingMessagesForProvider(
  state: PrototypeState,
  providerId: string,
): number {
  const bookings = (state.bookings ?? []).filter(
    (booking) => booking.providerId === providerId,
  );
  return bookings.reduce(
    (sum, booking) =>
      sum + unreadMessagesForBooking(state, booking, providerId),
    0,
  );
}
