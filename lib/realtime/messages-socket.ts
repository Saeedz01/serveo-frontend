import { io, type Socket } from "socket.io-client";
import type { MessageDto, MessageThreadDto } from "@/service/api";
import { API_BASE_URL } from "@/service/endpoint";

function messagesSocketUrl() {
  return API_BASE_URL.replace(/\/api\/?$/, "");
}

let sharedSocket: Socket | null = null;

function getSocket(): Socket {
  if (!sharedSocket) {
    sharedSocket = io(`${messagesSocketUrl()}/messages`, {
      autoConnect: true,
      transports: ["websocket", "polling"],
    });
  }
  return sharedSocket;
}

export function joinMessagesUserRoom(
  token: string,
): Promise<{ ok: boolean; error?: string }> {
  const socket = getSocket();
  return new Promise((resolve) => {
    const join = () => {
      socket
        .timeout(8000)
        .emit(
          "joinUser",
          { token },
          (err: Error | null, response?: { ok?: boolean; error?: string }) => {
            if (err) {
              resolve({ ok: false, error: err.message });
              return;
            }
            resolve({ ok: Boolean(response?.ok), error: response?.error });
          },
        );
    };
    if (socket.connected) {
      join();
      return;
    }
    socket.once("connect", join);
    socket.connect();
  });
}

export function joinMessageThreadRoom(
  threadId: string,
  token: string,
): Promise<{ ok: boolean; error?: string }> {
  const socket = getSocket();
  return new Promise((resolve) => {
    const join = () => {
      socket
        .timeout(8000)
        .emit(
          "joinThread",
          { threadId, token },
          (err: Error | null, response?: { ok?: boolean; error?: string }) => {
            if (err) {
              resolve({ ok: false, error: err.message });
              return;
            }
            resolve({ ok: Boolean(response?.ok), error: response?.error });
          },
        );
    };
    if (socket.connected) {
      join();
      return;
    }
    socket.once("connect", join);
    socket.connect();
  });
}

export function leaveMessageThreadRoom(threadId: string) {
  const socket = sharedSocket;
  if (!socket?.connected) return;
  socket.emit("leaveThread", { threadId });
}

export function emitTyping(
  threadId: string,
  token: string,
  isTyping: boolean,
) {
  const socket = getSocket();
  if (!socket.connected) return;
  socket.emit("typing", { threadId, token, isTyping });
}

export function onMessageCreated(
  handler: (message: MessageDto) => void,
): () => void {
  const socket = getSocket();
  const listener = (message: MessageDto) => handler(message);
  socket.on("message:created", listener);
  return () => {
    socket.off("message:created", listener);
  };
}

export function onMessageUpdated(
  handler: (message: MessageDto) => void,
): () => void {
  const socket = getSocket();
  const listener = (message: MessageDto) => handler(message);
  socket.on("message:updated", listener);
  return () => {
    socket.off("message:updated", listener);
  };
}

export function onThreadUpserted(
  handler: (thread: MessageThreadDto) => void,
): () => void {
  const socket = getSocket();
  const listener = (thread: MessageThreadDto) => handler(thread);
  socket.on("thread:upserted", listener);
  return () => {
    socket.off("thread:upserted", listener);
  };
}

export function onThreadRead(
  handler: (payload: {
    threadId: string;
    participantKey: string;
    lastReadAt: string;
  }) => void,
): () => void {
  const socket = getSocket();
  const listener = (payload: {
    threadId: string;
    participantKey: string;
    lastReadAt: string;
  }) => handler(payload);
  socket.on("thread:read", listener);
  return () => {
    socket.off("thread:read", listener);
  };
}

export function onTypingUpdate(
  handler: (payload: {
    threadId: string;
    participantKey: string;
    isTyping: boolean;
  }) => void,
): () => void {
  const socket = getSocket();
  const listener = (payload: {
    threadId: string;
    participantKey: string;
    isTyping: boolean;
  }) => handler(payload);
  socket.on("typing:update", listener);
  return () => {
    socket.off("typing:update", listener);
  };
}
