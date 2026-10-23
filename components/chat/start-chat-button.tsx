"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MessageSquare } from "lucide-react";
import { Button } from "@/components/ui";
import { useChat } from "@/components/chat/chat-provider";
import type { ChatActor } from "@/lib/chat/types";

type StartChatButtonProps = {
  peer: ChatActor;
  serviceId?: string;
  serviceTitle?: string;
  basePath: string;
  label?: string;
  variant?: "primary" | "secondary" | "ghost";
  className?: string;
  /** Force actor (admin messaging). Defaults to chat context actor. */
  asActor?: ChatActor;
};

export function StartChatButton({
  peer,
  serviceId,
  serviceTitle,
  basePath,
  label = "Message",
  variant = "secondary",
  className,
  asActor,
}: StartChatButtonProps) {
  const router = useRouter();
  const { transport, actor } = useChat();
  const [busy, setBusy] = useState(false);

  const openWithActor = async (me: ChatActor) => {
    setBusy(true);
    try {
      const thread = await transport.openThread({
        me,
        peer,
        serviceId,
        serviceTitle,
      });
      router.push(`${basePath}/${thread.id}`);
    } catch {
      /* keep user on page if open fails */
    } finally {
      setBusy(false);
    }
  };

  const handleClick = () => {
    if (busy) return;
    const me = asActor ?? actor;
    if (!me) return;
    void openWithActor(me);
  };

  return (
    <Button
      type="button"
      variant={variant}
      className={className}
      disabled={busy}
      onClick={handleClick}
    >
      <MessageSquare className="h-3.5 w-3.5" aria-hidden />
      {busy ? "Opening…" : label}
    </Button>
  );
}
