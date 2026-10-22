import type { ChatMessage, ChatThread } from "@/lib/prototype-types";
import type {
  MessageDto,
  MessageThreadDto,
} from "@/service/api";
import { API_BASE_URL, MESSAGE_ENDPOINTS } from "@/service/endpoint";
import { getAccessToken } from "@/service/splitApiSetting";
import {
  joinMessageThreadRoom,
  joinMessagesUserRoom,
  leaveMessageThreadRoom,
  onMessageCreated,
  onThreadRead,
  onThreadUpserted,
} from "@/lib/realtime/messages-socket";
import type { ChatTransport } from "./chat-transport";
import type {
  ChatActor,
  ChatEvent,
  OpenThreadInput,
  SendMessageInput,
  ThreadListItem,
} from "./types";

type Cache = {
  threads: Map<string, MessageThreadDto>;
  messages: Map<string, MessageDto[]>;
};

function participantKey(actor: { role: string; id: string }) {
  return `${actor.role}:${actor.id}`;
}

function toChatThread(dto: MessageThreadDto): ChatThread {
  return {
    id: dto.id,
    participants: dto.participants,
    participantNames: dto.participantNames,
    contextServiceId: dto.contextServiceId,
    contextServiceTitle: dto.contextServiceTitle,
    contextBookingId: dto.contextBookingId,
    lastMessageAt: dto.lastMessageAt,
    lastMessagePreview: dto.lastMessagePreview,
    createdAt: dto.createdAt,
  };
}

function toChatMessage(dto: MessageDto): ChatMessage {
  return {
    id: dto.id,
    threadId: dto.threadId,
    sender: dto.sender,
    body: dto.body,
    createdAt: dto.createdAt,
    status: dto.status,
  };
}

async function apiFetch<T>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  const token = getAccessToken();
  if (!token) {
    throw new Error("Sign in to use messages.");
  }
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...(init?.headers ?? {}),
    },
  });
  if (!response.ok) {
    let message = "Request failed.";
    try {
      const body = (await response.json()) as { message?: string | string[] };
      if (Array.isArray(body.message)) message = body.message.join(" ");
      else if (typeof body.message === "string") message = body.message;
    } catch {
      /* ignore */
    }
    throw new Error(message);
  }
  if (response.status === 204) return undefined as T;
  return (await response.json()) as T;
}

/**
 * Server-backed chat transport with an in-memory cache + Socket.io updates.
 */
export function createApiChatTransport(): ChatTransport {
  const cache: Cache = {
    threads: new Map(),
    messages: new Map(),
  };
  const listeners = new Set<(event: ChatEvent) => void>();
  let socketBound = false;
  let self: ChatActor | null = null;
  const joinedThreads = new Set<string>();
  const activeThreadId = { current: null as string | null };

  const emit = (event: ChatEvent) => {
    for (const listener of listeners) listener(event);
  };

  const upsertThread = (dto: MessageThreadDto) => {
    // While the conversation is open, never surface unread for that thread.
    const next =
      activeThreadId.current === dto.id
        ? { ...dto, unreadCount: 0 }
        : dto;
    cache.threads.set(next.id, next);
    emit({ type: "thread.upserted", thread: toChatThread(next) });
  };

  const upsertMessage = (dto: MessageDto) => {
    const list = cache.messages.get(dto.threadId) ?? [];
    const isNew = !list.some((item) => item.id === dto.id);
    if (isNew) {
      cache.messages.set(
        dto.threadId,
        [...list, dto].sort((a, b) => a.createdAt.localeCompare(b.createdAt)),
      );
    }

    const thread = cache.threads.get(dto.threadId);
    const isOwn =
      self != null && participantKey(dto.sender) === participantKey(self);
    const viewing = activeThreadId.current === dto.threadId;

    if (thread) {
      let unreadCount = thread.unreadCount;
      if (isNew && !isOwn && !viewing) {
        unreadCount = thread.unreadCount + 1;
      }
      cache.threads.set(dto.threadId, {
        ...thread,
        lastMessageAt: dto.createdAt,
        lastMessagePreview: dto.body.slice(0, 160),
        unreadCount,
      });
    } else if (!isOwn) {
      // Thread not cached yet — pull authoritative row (includes unread).
      void apiFetch<MessageThreadDto>(MESSAGE_ENDPOINTS.thread(dto.threadId))
        .then((fetched) => {
          upsertThread(fetched);
        })
        .catch(() => undefined);
    }

    if (isNew) {
      emit({ type: "message.created", message: toChatMessage(dto) });
    }
  };

  const ensureSockets = (token: string) => {
    if (socketBound) return;
    socketBound = true;
    void joinMessagesUserRoom(token);
    onMessageCreated((message) => {
      upsertMessage(message);
    });
    onThreadUpserted((thread) => {
      // Server DTO is scoped to this user — trust unreadCount.
      upsertThread(thread);
    });
    onThreadRead((payload) => {
      if (self && payload.participantKey === participantKey(self)) {
        const thread = cache.threads.get(payload.threadId);
        if (thread && thread.unreadCount > 0) {
          cache.threads.set(payload.threadId, { ...thread, unreadCount: 0 });
        }
      }
      emit({
        type: "thread.read",
        threadId: payload.threadId,
        participantKey: payload.participantKey,
        lastReadAt: payload.lastReadAt,
      });
    });
  };

  const listThreads = (me: ChatActor): ThreadListItem[] => {
    return [...cache.threads.values()]
      .map((dto) => {
        const thread = toChatThread(dto);
        const peer =
          dto.participants.find(
            (item) => participantKey(item) !== participantKey(me),
          ) ?? dto.peer;
        const peerKey = participantKey(peer);
        return {
          ...thread,
          peer,
          peerName:
            dto.participantNames[peerKey] ??
            (peer.role === "admin" ? "Serveo Admin" : dto.peerName),
          unreadCount: dto.unreadCount,
        };
      })
      .sort((a, b) => b.lastMessageAt.localeCompare(a.lastMessageAt));
  };

  return {
    listThreads,

    getThread: (threadId) => {
      const dto = cache.threads.get(threadId);
      return dto ? toChatThread(dto) : undefined;
    },

    listMessages: (threadId) =>
      (cache.messages.get(threadId) ?? []).map(toChatMessage),

    openThread: async (input: OpenThreadInput) => {
      const body: Record<string, string> = {};
      if (input.bookingId) {
        body.bookingId = input.bookingId;
      } else if (
        (input.me.role === "admin" || input.me.role === "seeker") &&
        input.peer.role === "provider"
      ) {
        body.providerId = input.peer.id;
        if (input.serviceId) body.serviceId = input.serviceId;
        if (input.serviceTitle) body.serviceTitle = input.serviceTitle;
      } else if (input.me.role === "provider" && input.peer.role === "seeker") {
        throw new Error("Open chat from a booking when messaging a seeker.");
      } else {
        throw new Error("Unsupported chat participants.");
      }

      self = input.me;
      const dto = await apiFetch<MessageThreadDto>(MESSAGE_ENDPOINTS.threads, {
        method: "POST",
        body: JSON.stringify(body),
      });
      upsertThread(dto);
      const token = getAccessToken();
      if (token && !joinedThreads.has(dto.id)) {
        joinedThreads.add(dto.id);
        void joinMessageThreadRoom(dto.id, token);
      }
      return toChatThread(dto);
    },

    sendMessage: async (input: SendMessageInput) => {
      self = input.sender;
      const dto = await apiFetch<MessageDto>(
        MESSAGE_ENDPOINTS.messages(input.threadId),
        {
          method: "POST",
          body: JSON.stringify({ body: input.body }),
        },
      );
      const list = cache.messages.get(input.threadId) ?? [];
      if (!list.some((item) => item.id === dto.id)) {
        cache.messages.set(input.threadId, [...list, dto]);
      }
      const thread = cache.threads.get(input.threadId);
      if (thread) {
        cache.threads.set(input.threadId, {
          ...thread,
          lastMessageAt: dto.createdAt,
          lastMessagePreview: dto.body.slice(0, 160),
        });
      }
      emit({ type: "message.created", message: toChatMessage(dto) });
      return toChatMessage(dto);
    },

    markRead: (threadId, me) => {
      self = me;
      activeThreadId.current = threadId;
      const thread = cache.threads.get(threadId);
      if (thread && thread.unreadCount > 0) {
        cache.threads.set(threadId, { ...thread, unreadCount: 0 });
        emit({
          type: "thread.read",
          threadId,
          participantKey: participantKey(me),
          lastReadAt: new Date().toISOString(),
        });
      }
      void apiFetch(MESSAGE_ENDPOINTS.read(threadId), { method: "POST" }).catch(
        () => undefined,
      );
    },

    resolvePeerName: (peer) => {
      for (const thread of cache.threads.values()) {
        const key = participantKey(peer);
        if (thread.participantNames[key]) return thread.participantNames[key];
        if (participantKey(thread.peer) === key) return thread.peerName;
      }
      if (peer.role === "provider") return "Provider";
      if (peer.role === "admin") return "Serveo Admin";
      return "Seeker";
    },

    unreadCount: (me) =>
      listThreads(me).reduce((sum, thread) => sum + thread.unreadCount, 0),

    subscribe: (listener) => {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },

    hydrate: async (me) => {
      self = me;
      const token = getAccessToken();
      if (!token) return;
      ensureSockets(token);
      const threads = await apiFetch<MessageThreadDto[]>(
        MESSAGE_ENDPOINTS.threads,
      );
      cache.threads.clear();
      for (const thread of threads) {
        cache.threads.set(thread.id, thread);
      }
      // Nudge subscribers to re-read listThreads from cache.
      if (threads[0]) {
        emit({ type: "thread.upserted", thread: toChatThread(threads[0]) });
      } else {
        for (const listener of listeners) {
          listener({
            type: "thread.read",
            threadId: "",
            participantKey: "",
            lastReadAt: new Date().toISOString(),
          });
        }
      }
    },

    setActiveThread: (threadId) => {
      activeThreadId.current = threadId;
    },

    hydrateThread: async (threadId) => {
      const token = getAccessToken();
      if (!token) return;
      ensureSockets(token);
      activeThreadId.current = threadId;
      if (!joinedThreads.has(threadId)) {
        joinedThreads.add(threadId);
        void joinMessageThreadRoom(threadId, token);
      } else {
        leaveMessageThreadRoom(threadId);
        void joinMessageThreadRoom(threadId, token);
      }
      const [thread, messages] = await Promise.all([
        apiFetch<MessageThreadDto>(MESSAGE_ENDPOINTS.thread(threadId)),
        apiFetch<MessageDto[]>(MESSAGE_ENDPOINTS.messages(threadId)),
      ]);
      // Viewing: treat as read locally; server markRead follows from useChatThread.
      cache.threads.set(thread.id, { ...thread, unreadCount: 0 });
      cache.messages.set(threadId, messages);
      emit({ type: "thread.upserted", thread: toChatThread({ ...thread, unreadCount: 0 }) });
      for (const message of messages) {
        emit({ type: "message.created", message: toChatMessage(message) });
      }
    },
  };
}
