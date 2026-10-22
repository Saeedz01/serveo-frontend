"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { usePathname } from "next/navigation";
import { usePrototype } from "@/components/prototype/prototype-provider";
import { createApiChatTransport } from "@/lib/chat/api-transport";
import type { ChatTransport } from "@/lib/chat/chat-transport";
import { createLocalChatTransport } from "@/lib/chat/local-transport";
import type { ChatActor, ThreadListItem } from "@/lib/chat/types";
import { getStoredAuthUser } from "@/service/auth-session";
import { getAccessToken } from "@/service/splitApiSetting";

type ChatContextValue = {
  transport: ChatTransport;
  actor: ChatActor | null;
  surface: "seeker" | "provider" | "admin" | "none";
  threads: ThreadListItem[];
  unreadCount: number;
  revision: number;
};

const ChatContext = createContext<ChatContextValue | null>(null);

function resolveSurface(
  pathname: string,
): "seeker" | "provider" | "admin" | "none" {
  if (pathname.startsWith("/admin")) return "admin";
  if (pathname.startsWith("/provider")) return "provider";
  if (pathname.startsWith("/messages")) return "seeker";
  if (pathname.startsWith("/seeker")) return "seeker";
  return "none";
}

function shouldUseApiTransport(
  surface: "seeker" | "provider" | "admin" | "none",
): boolean {
  const token = getAccessToken();
  const user = getStoredAuthUser();
  if (!token || !user) return false;
  if (surface === "admin") return user.role === "ADMIN";
  if (surface === "provider") return user.role === "PROVIDER";
  if (surface === "seeker" || surface === "none") return user.role === "SEEKER";
  return false;
}

export function ChatProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { ready, state, commit, currentProvider, currentSeeker, adminAuthenticated } =
    usePrototype();
  const stateRef = useRef(state);
  stateRef.current = state;

  const [revision, setRevision] = useState(0);
  const surface = resolveSurface(pathname);
  const useApi = shouldUseApiTransport(surface);

  const syncCommit = useMemo(
    () => (updater: (prev: typeof state) => typeof state) => {
      commit((prev) => {
        const next = updater(prev);
        stateRef.current = next;
        return next;
      });
    },
    [commit],
  );

  const localTransport = useMemo(
    () =>
      createLocalChatTransport({
        getState: () => stateRef.current,
        commit: syncCommit,
      }),
    [syncCommit],
  );

  const apiTransport = useMemo(() => createApiChatTransport(), []);

  const transport = useApi ? apiTransport : localTransport;

  useEffect(() => {
    return transport.subscribe(() => {
      setRevision((value) => value + 1);
    });
  }, [transport]);

  const actor = useMemo<ChatActor | null>(() => {
    if (!ready) return null;
    const authUser = getStoredAuthUser();

    if (surface === "admin" && (adminAuthenticated || authUser?.role === "ADMIN")) {
      // Prefer real admin user id so API threads persist under the logged-in admin.
      if (authUser?.role === "ADMIN" && authUser.id) {
        return { role: "admin", id: authUser.id };
      }
      return null;
    }
    if (surface === "provider" && currentProvider) {
      return { role: "provider", id: currentProvider.id };
    }
    if ((surface === "seeker" || surface === "none") && currentSeeker) {
      return { role: "seeker", id: currentSeeker.id };
    }
    return null;
  }, [
    adminAuthenticated,
    currentProvider,
    currentSeeker,
    ready,
    surface,
  ]);

  useEffect(() => {
    if (!actor || !useApi || !transport.hydrate) return;
    void transport.hydrate(actor).catch(() => undefined);
  }, [actor, transport, useApi]);

  const threads = useMemo(() => {
    if (!actor) return [];
    void revision;
    void state.chatThreads;
    void state.chatMessages;
    void state.chatReadStates;
    return transport.listThreads(actor);
  }, [
    actor,
    revision,
    state.chatMessages,
    state.chatReadStates,
    state.chatThreads,
    transport,
  ]);

  const unreadCount = useMemo(() => {
    if (!actor) return 0;
    void revision;
    return transport.unreadCount(actor);
  }, [actor, revision, transport, state.chatMessages, state.chatReadStates]);

  const value = useMemo<ChatContextValue>(
    () => ({
      transport,
      actor,
      surface,
      threads,
      unreadCount,
      revision,
    }),
    [actor, revision, surface, threads, transport, unreadCount],
  );

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}

export function useChat() {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error("useChat must be used within ChatProvider");
  }
  return context;
}
