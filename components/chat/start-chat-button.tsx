"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MessageSquare } from "lucide-react";
import { Button } from "@/components/ui";
import { useChat } from "@/components/chat/chat-provider";
import { usePrototype } from "@/components/prototype/prototype-provider";
import type { ChatActor } from "@/lib/chat/types";
import { SeekerIdentifyDialog } from "./seeker-identify-dialog";

type StartChatButtonProps = {
  peer: ChatActor;
  serviceId?: string;
  serviceTitle?: string;
  basePath: string;
  label?: string;
  variant?: "primary" | "secondary" | "ghost";
  className?: string;
  /** When true, open identify dialog if no seeker session (seeker→provider). */
  requireSeeker?: boolean;
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
  requireSeeker = false,
  asActor,
}: StartChatButtonProps) {
  const router = useRouter();
  const { transport, actor } = useChat();
  const { currentSeeker } = usePrototype();
  const [identifyOpen, setIdentifyOpen] = useState(false);

  const openWithActor = (me: ChatActor) => {
    const thread = transport.openThread({
      me,
      peer,
      serviceId,
      serviceTitle,
    });
    const href = `${basePath}/${thread.id}`;
    router.push(href);
  };

  const handleClick = () => {
    if (requireSeeker) {
      if (!currentSeeker) {
        setIdentifyOpen(true);
        return;
      }
      openWithActor({ role: "seeker", id: currentSeeker.id });
      return;
    }

    const me = asActor ?? actor;
    if (!me) return;
    openWithActor(me);
  };

  return (
    <>
      <Button
        type="button"
        variant={variant}
        className={className}
        onClick={handleClick}
      >
        <MessageSquare className="h-3.5 w-3.5" aria-hidden />
        {label}
      </Button>
      {requireSeeker ? (
        <SeekerIdentifyDialog
          open={identifyOpen}
          onCancel={() => setIdentifyOpen(false)}
          onIdentified={(seekerId) => {
            setIdentifyOpen(false);
            openWithActor({ role: "seeker", id: seekerId });
          }}
        />
      ) : null}
    </>
  );
}
