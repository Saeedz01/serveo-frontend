import type { ChatMessage, ChatThread } from "@/lib/prototype-types";
import type {
  MessageDto,
  MessagePageDto,
  MessageThreadDto,
} from "@/service/api";
import { API_BASE_URL, MESSAGE_ENDPOINTS } from "@/service/endpoint";
import { getAccessToken } from "@/service/splitApiSetting";
import {
  emitTyping,
  joinMessageThreadRoom,
  joinMessagesUserRoom,
  leaveMessageThreadRoom,
  onMessageCreated,
  onMessageUpdated,
  onThreadRead,
  onThreadUpserted,
  onTypingUpdate,
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
  hasMore: Map<string, boolean>;
  nextCursor: Map<string, string | null>;
  typing: Map<string, string>;
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
    attachments: dto.attachments ?? [],
    createdAt: dto.createdAt,
    editedAt: dto.editedAt,
    deletedAt: dto.deletedAt,
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

function mergeMessages(
  existing: MessageDto[],
  incoming: MessageDto[],
  mode: "replace" | "prepend" | "append" | "upsert",
): MessageDto[] {
  if (mode === "replace") {
    return [...incoming].sort((a, b) =>
      a.createdAt.localeCompare(b.createdAt),
    );
  }
  const byId = new Map(existing.map((item) => [item.id, item]));
  for (const item of incoming) {
    byId.set(item.id, item);
  }
  return [...byId.values()].sort((a, b) =>
    a.createdAt.localeCompare(b.createdAt),
  );
}

/**
 * Server-backed chat transport with an in-memory cache + Socket.io updates.
 */
export function createApiChatTransport(): ChatTransport {
  const cache: Cache = {
    threads: new Map(),
    messages: new Map(),
    hasMore: new Map(),
    nextCursor: new Map(),
    typing: new Map(),
  };
  const listeners = new Set<(event: ChatEvent) => void>();
  let socketBound = false;
  let self: ChatActor | null = null;
  const joinedThreads = new Set<string>();
  const activeThreadId = { current: null as string | null };
  const typingTimers = new Map<string, ReturnType<typeof setTimeout>>();

  const emit = (event: ChatEvent) => {
    for (const listener of listeners) listener(event);
  };

  const upsertThread = (dto: MessageThreadDto) => {
    const next =
      activeThreadId.current === dto.id
        ? { ...dto, unreadCount: 0 }
        : dto;
    cache.threads.set(next.id, next);
    emit({ type: "thread.upserted", thread: toChatThread(next) });
  };

  const putMessage = (dto: MessageDto, bumpUnread: boolean) => {
    const list = cache.messages.get(dto.threadId) ?? [];
    const isNew = !list.some((item) => item.id === dto.id);
    cache.messages.set(
      dto.threadId,
      mergeMessages(list, [dto], "upsert"),
    );

    const thread = cache.threads.get(dto.threadId);
    const isOwn =
      self != null && participantKey(dto.sender) === participantKey(self);
    const viewing = activeThreadId.current === dto.threadId;

    if (thread && !dto.deletedAt) {
      let unreadCount = thread.unreadCount;
      if (bumpUnread && isNew && !isOwn && !viewing) {
        unreadCount = thread.unreadCount + 1;
      }
      cache.threads.set(dto.threadId, {
        ...thread,
        lastMessageAt: dto.createdAt,
        lastMessagePreview: dto.deletedAt
          ? "Message deleted"
          : dto.body.slice(0, 160) ||
            (dto.attachments[0]
              ? `Attachment: ${dto.attachments[0].name}`
              : thread.lastMessagePreview),
        unreadCount,
      });
    } else if (!thread && !isOwn) {
      void apiFetch<MessageThreadDto>(MESSAGE_ENDPOINTS.thread(dto.threadId))
        .then((fetched) => upsertThread(fetched))
        .catch(() => undefined);
    }

    if (isNew) {
      emit({ type: "message.created", message: toChatMessage(dto) });
    } else {
      emit({ type: "message.updated", message: toChatMessage(dto) });
    }

    // Ack delivery for peer messages we just learned about.
    if (!isOwn && isNew && !dto.deletedAt) {
      void apiFetch(MESSAGE_ENDPOINTS.delivered(dto.threadId), {
        method: "POST",
        body: JSON.stringify({ messageIds: [dto.id] }),
      }).catch(() => undefined);
    }
  };

  const ensureSockets = (token: string) => {
    if (socketBound) return;
    socketBound = true;
    void joinMessagesUserRoom(token);
    onMessageCreated((message) => {
      putMessage(
        {
          ...message,
          attachments: message.attachments ?? [],
          editedAt: message.editedAt ?? null,
          deletedAt: message.deletedAt ?? null,
        },
        true,
      );
    });
    onMessageUpdated((message) => {
      putMessage(
        {
          ...message,
          attachments: message.attachments ?? [],
          editedAt: message.editedAt ?? null,
          deletedAt: message.deletedAt ?? null,
        },
        false,
      );
    });
    onThreadUpserted((thread) => {
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
    onTypingUpdate((payload) => {
      if (payload.isTyping) {
        cache.typing.set(payload.threadId, payload.participantKey);
        const prev = typingTimers.get(payload.threadId);
        if (prev) clearTimeout(prev);
        typingTimers.set(
          payload.threadId,
          setTimeout(() => {
            cache.typing.delete(payload.threadId);
            emit({
              type: "typing",
              threadId: payload.threadId,
              participantKey: payload.participantKey,
              isTyping: false,
            });
          }, 4000),
        );
      } else {
        cache.typing.delete(payload.threadId);
      }
      emit({
        type: "typing",
        threadId: payload.threadId,
        participantKey: payload.participantKey,
        isTyping: payload.isTyping,
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
          body: JSON.stringify({
            body: input.body,
            attachments: input.attachments,
          }),
        },
      );
      putMessage(
        {
          ...dto,
          attachments: dto.attachments ?? [],
          editedAt: dto.editedAt ?? null,
          deletedAt: dto.deletedAt ?? null,
        },
        false,
      );
      return toChatMessage(dto);
    },

    editMessage: async (threadId, messageId, body) => {
      const dto = await apiFetch<MessageDto>(
        MESSAGE_ENDPOINTS.message(threadId, messageId),
        {
          method: "PATCH",
          body: JSON.stringify({ body }),
        },
      );
      putMessage(
        {
          ...dto,
          attachments: dto.attachments ?? [],
          editedAt: dto.editedAt ?? null,
          deletedAt: dto.deletedAt ?? null,
        },
        false,
      );
      return toChatMessage(dto);
    },

    deleteMessage: async (threadId, messageId) => {
      const dto = await apiFetch<MessageDto>(
        MESSAGE_ENDPOINTS.message(threadId, messageId),
        { method: "DELETE" },
      );
      putMessage(
        {
          ...dto,
          attachments: dto.attachments ?? [],
          editedAt: dto.editedAt ?? null,
          deletedAt: dto.deletedAt ?? null,
        },
        false,
      );
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

    setTyping: (threadId, isTyping) => {
      const token = getAccessToken();
      if (!token) return;
      emitTyping(threadId, token, isTyping);
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

    hydrate: async (me, search) => {
      self = me;
      const token = getAccessToken();
      if (!token) return;
      ensureSockets(token);
      const path =
        search && search.trim()
          ? MESSAGE_ENDPOINTS.threadsSearch(search.trim())
          : MESSAGE_ENDPOINTS.threads;
      const threads = await apiFetch<MessageThreadDto[]>(path);
      cache.threads.clear();
      for (const thread of threads) {
        cache.threads.set(thread.id, thread);
      }
      if (threads[0]) {
        emit({ type: "thread.upserted", thread: toChatThread(threads[0]) });
      } else {
        emit({
          type: "thread.read",
          threadId: "",
          participantKey: "",
          lastReadAt: new Date().toISOString(),
        });
      }
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
      const [thread, page] = await Promise.all([
        apiFetch<MessageThreadDto>(MESSAGE_ENDPOINTS.thread(threadId)),
        apiFetch<MessagePageDto>(
          MESSAGE_ENDPOINTS.messages(threadId, { limit: 40 }),
        ),
      ]);
      cache.threads.set(thread.id, { ...thread, unreadCount: 0 });
      cache.messages.set(threadId, page.items);
      cache.hasMore.set(threadId, page.hasMore);
      cache.nextCursor.set(threadId, page.nextCursor);
      emit({
        type: "thread.upserted",
        thread: toChatThread({ ...thread, unreadCount: 0 }),
      });
      for (const message of page.items) {
        emit({ type: "message.created", message: toChatMessage(message) });
      }

      const peerIds = page.items
        .filter(
          (item) =>
            !item.deletedAt &&
            self != null &&
            participantKey(item.sender) !== participantKey(self),
        )
        .map((item) => item.id);
      if (peerIds.length > 0) {
        void apiFetch(MESSAGE_ENDPOINTS.delivered(threadId), {
          method: "POST",
          body: JSON.stringify({ messageIds: peerIds }),
        }).catch(() => undefined);
      }
    },

    loadOlderMessages: async (threadId) => {
      const cursor = cache.nextCursor.get(threadId);
      if (!cache.hasMore.get(threadId) || !cursor) return false;
      const page = await apiFetch<MessagePageDto>(
        MESSAGE_ENDPOINTS.messages(threadId, { cursor, limit: 40 }),
      );
      const existing = cache.messages.get(threadId) ?? [];
      cache.messages.set(
        threadId,
        mergeMessages(existing, page.items, "upsert"),
      );
      cache.hasMore.set(threadId, page.hasMore);
      cache.nextCursor.set(threadId, page.nextCursor);
      for (const message of page.items) {
        emit({ type: "message.created", message: toChatMessage(message) });
      }
      return page.hasMore;
    },

    searchMessages: async (threadId, q) => {
      const page = await apiFetch<MessagePageDto>(
        MESSAGE_ENDPOINTS.messages(threadId, { q, limit: 50 }),
      );
      return page.items.map(toChatMessage);
    },

    setActiveThread: (threadId) => {
      activeThreadId.current = threadId;
    },

    threadHasMore: (threadId) => Boolean(cache.hasMore.get(threadId)),

    getTypingPeer: (threadId) => cache.typing.get(threadId) ?? null,
  };
}
