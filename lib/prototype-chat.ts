import { upsertNotificationByHref } from "./prototype-notifications";
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
  PrototypeSeeker,
  PrototypeState,
} from "./prototype-types";

export {
  displayNameForParticipant,
  makeThreadId,
  participantKey,
  resolveParticipantName,
} from "./prototype-chat-names";

function createId(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 9)}`;
}

function normalizePhone(phone: string) {
  return phone.replace(/[^\d+]/g, "");
}

export function identifySeeker(
  state: PrototypeState,
  input: { name: string; phone: string },
): { state: PrototypeState; seeker: PrototypeSeeker } {
  const name = input.name.trim();
  const phone = input.phone.trim();
  const normalized = normalizePhone(phone);
  const existing = (state.seekers ?? []).find(
    (seeker) => normalizePhone(seeker.phone) === normalized,
  );

  if (existing) {
    const seeker =
      existing.name === name ? existing : { ...existing, name };
    return {
      seeker,
      state: {
        ...state,
        currentSeekerId: seeker.id,
        seekers: (state.seekers ?? []).map((item) =>
          item.id === seeker.id ? seeker : item,
        ),
      },
    };
  }

  const seeker: PrototypeSeeker = {
    id: createId("seek"),
    name,
    phone,
    createdAt: new Date().toISOString(),
  };

  return {
    seeker,
    state: {
      ...state,
      currentSeekerId: seeker.id,
      seekers: [seeker, ...(state.seekers ?? [])],
    },
  };
}

export function clearCurrentSeeker(state: PrototypeState): PrototypeState {
  return { ...state, currentSeekerId: null };
}

export function openChatThread(
  state: PrototypeState,
  input: {
    me: ChatParticipant;
    peer: ChatParticipant;
    serviceId?: string;
    serviceTitle?: string;
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
    next = upsertNotificationByHref(next, {
      providerId: providerPeer.id,
      type: "chat_message",
      title: senderName,
      body: body.slice(0, 120),
      href: `/provider/messages/${input.threadId}`,
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
