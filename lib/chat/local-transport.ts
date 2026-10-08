import {
  appendChatMessage,
  displayNameForParticipant,
  markThreadRead,
  messagesForThread,
  openChatThread,
  participantKey,
  threadsForParticipant,
  unreadCountForThread,
  updateChatMessageStatus,
} from "@/lib/prototype-chat";
import type { PrototypeState } from "@/lib/prototype-types";
import type { ChatTransport } from "./chat-transport";
import type {
  ChatActor,
  ChatEvent,
  OpenThreadInput,
  SendMessageInput,
  ThreadListItem,
} from "./types";

const CHANNEL = "serveo-chat";
const SAME_TAB_EVENT = "serveo-chat-event";

export type LocalTransportDeps = {
  getState: () => PrototypeState;
  commit: (updater: (prev: PrototypeState) => PrototypeState) => void;
};

function emit(event: ChatEvent) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(SAME_TAB_EVENT, { detail: event }));
  try {
    const channel = new BroadcastChannel(CHANNEL);
    channel.postMessage(event);
    channel.close();
  } catch {
    // BroadcastChannel unsupported — same-tab CustomEvent still works.
  }
}

export function createLocalChatTransport(
  deps: LocalTransportDeps,
): ChatTransport {
  const listThreads = (me: ChatActor): ThreadListItem[] => {
    const state = deps.getState();
    return threadsForParticipant(state, me).map((thread) => {
      const peer =
        thread.participants.find(
          (item) => participantKey(item) !== participantKey(me),
        ) ?? thread.participants[0];
      return {
        ...thread,
        peer,
        peerName: displayNameForParticipant(state, peer, thread),
        unreadCount: unreadCountForThread(state, thread.id, me),
      };
    });
  };

  return {
    listThreads,

    getThread: (threadId) =>
      deps.getState().chatThreads?.find((thread) => thread.id === threadId),

    listMessages: (threadId) => messagesForThread(deps.getState(), threadId),

    openThread: (input: OpenThreadInput) => {
      let thread = openChatThread(deps.getState(), input).thread;
      deps.commit((prev) => {
        const result = openChatThread(prev, input);
        thread = result.thread;
        return result.state;
      });
      emit({ type: "thread.upserted", thread });
      return thread;
    },

    sendMessage: (input: SendMessageInput) => {
      const tempId = `msg-temp-${Math.random().toString(36).slice(2, 9)}`;
      let message = appendChatMessage(deps.getState(), {
        ...input,
        id: tempId,
        status: "sending",
      }).message;

      deps.commit((prev) => {
        const result = appendChatMessage(prev, {
          ...input,
          id: tempId,
          status: "sending",
        });
        message = result.message;
        return result.state;
      });
      emit({ type: "message.created", message });

      queueMicrotask(() => {
        deps.commit((prev) => updateChatMessageStatus(prev, tempId, "sent"));
        emit({
          type: "message.status",
          messageId: tempId,
          threadId: input.threadId,
          status: "sent",
        });
      });

      return message;
    },

    markRead: (threadId, me) => {
      const lastReadAt = new Date().toISOString();
      deps.commit((prev) => markThreadRead(prev, threadId, me));
      emit({
        type: "thread.read",
        threadId,
        participantKey: participantKey(me),
        lastReadAt,
      });
    },

    resolvePeerName: (peer) =>
      displayNameForParticipant(deps.getState(), peer),

    unreadCount: (me) =>
      listThreads(me).reduce((sum, thread) => sum + thread.unreadCount, 0),

    subscribe: (listener) => {
      if (typeof window === "undefined") return () => undefined;

      const onSameTab = (event: Event) => {
        listener((event as CustomEvent<ChatEvent>).detail);
      };
      window.addEventListener(SAME_TAB_EVENT, onSameTab);

      let channel: BroadcastChannel | null = null;
      try {
        channel = new BroadcastChannel(CHANNEL);
        channel.onmessage = (event) => {
          listener(event.data as ChatEvent);
        };
      } catch {
        channel = null;
      }

      return () => {
        window.removeEventListener(SAME_TAB_EVENT, onSameTab);
        channel?.close();
      };
    },
  };
}
