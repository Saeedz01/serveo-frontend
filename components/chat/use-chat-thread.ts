"use client";

import { useEffect, useMemo, useState } from "react";
import { usePrototype } from "@/components/prototype/prototype-provider";
import { displayNameForParticipant } from "@/lib/prototype-chat";
import type { ChatMessage } from "@/lib/prototype-types";
import { useChat } from "./chat-provider";

export function useChatThread(threadId: string | null) {
  const { transport, actor, revision } = useChat();
  const { state } = usePrototype();
  const [tick, setTick] = useState(0);

  useEffect(() => {
    return transport.subscribe(() => setTick((value) => value + 1));
  }, [transport]);

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

  useEffect(() => {
    if (!threadId || !actor) return;
    transport.markRead(threadId, actor);
  }, [actor, messages.length, threadId, transport]);

  const send = (body: string, serviceId?: string) => {
    if (!threadId || !actor || !body.trim()) return null;
    return transport.sendMessage({
      threadId,
      sender: actor,
      body,
      serviceId,
    });
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

  return { thread, messages, peer, peerName, send, actor };
}
