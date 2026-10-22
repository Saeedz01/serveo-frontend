"use client";

import { useEffect, useMemo, useState } from "react";
import { usePrototype } from "@/components/prototype/prototype-provider";
import { displayNameForParticipant } from "@/lib/prototype-chat";
import type { ChatMessage } from "@/lib/prototype-types";
import type { PendingAttachment } from "@/lib/chat/chat-transport";
import { useChat } from "./chat-provider";

export function useChatThread(threadId: string | null) {
  const { transport, actor, revision } = useChat();
  const { state } = usePrototype();
  const [tick, setTick] = useState(0);
  const [loadingOlder, setLoadingOlder] = useState(false);
  const [typingPeer, setTypingPeer] = useState<string | null>(null);

  useEffect(() => {
    return transport.subscribe((event) => {
      setTick((value) => value + 1);
      if (
        event.type === "typing" &&
        threadId &&
        event.threadId === threadId
      ) {
        setTypingPeer(event.isTyping ? event.participantKey : null);
      }
    });
  }, [threadId, transport]);

  const thread = useMemo(() => {
    if (!threadId) return undefined;
    void revision;
    void tick;
    void state.chatThreads;
    return transport.getThread(threadId);
  }, [revision, state.chatThreads, threadId, tick, transport]);

  const messages = useMemo(() => {
    if (!threadId) return [] as ChatMessage[];
    void revision;
    void tick;
    void state.chatMessages;
    return transport.listMessages(threadId);
  }, [revision, state.chatMessages, threadId, tick, transport]);

  const hasMore = Boolean(
    threadId && transport.threadHasMore?.(threadId),
  );

  useEffect(() => {
    if (!threadId || !transport.hydrateThread) return;
    void transport.hydrateThread(threadId).catch(() => undefined);
  }, [threadId, transport]);

  useEffect(() => {
    if (!threadId) return;
    transport.setActiveThread?.(threadId);
    return () => {
      transport.setActiveThread?.(null);
      transport.setTyping?.(threadId, false);
    };
  }, [threadId, transport]);

  useEffect(() => {
    if (!threadId || !actor) return;
    transport.markRead(threadId, actor);
  }, [actor, messages.length, threadId, transport]);

  const send = async (
    body: string,
    attachments: PendingAttachment[] = [],
    serviceId?: string,
  ) => {
    if (!threadId || !actor) return null;
    if (!body.trim() && attachments.length === 0) return null;
    return transport.sendMessage({
      threadId,
      sender: actor,
      body,
      attachments,
      serviceId,
    });
  };

  const loadOlder = async () => {
    if (!threadId || !transport.loadOlderMessages || loadingOlder) return;
    setLoadingOlder(true);
    try {
      await transport.loadOlderMessages(threadId);
    } finally {
      setLoadingOlder(false);
    }
  };

  const edit = async (messageId: string, body: string) => {
    if (!threadId || !transport.editMessage) return;
    await transport.editMessage(threadId, messageId, body);
  };

  const remove = async (messageId: string) => {
    if (!threadId || !transport.deleteMessage) return;
    await transport.deleteMessage(threadId, messageId);
  };

  const setTyping = (isTyping: boolean) => {
    if (!threadId) return;
    transport.setTyping?.(threadId, isTyping);
  };

  const peer = useMemo(() => {
    if (!thread || !actor) return undefined;
    return thread.participants.find(
      (participant) =>
        !(
          participant.role === actor.role && participant.id === actor.id
        ),
    );
  }, [actor, thread]);

  const peerName = peer
    ? displayNameForParticipant(state, peer, thread)
    : "";

  const typingLabel =
    typingPeer && peer
      ? `${peerName || "Someone"} is typing…`
      : null;

  return {
    thread,
    messages,
    peer,
    peerName,
    send,
    actor,
    hasMore,
    loadingOlder,
    loadOlder,
    edit,
    remove,
    setTyping,
    typingLabel,
  };
}
