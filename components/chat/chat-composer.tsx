"use client";

import { useState } from "react";
import { Send } from "lucide-react";
import { Button, Textarea } from "@/components/ui";

type ChatComposerProps = {
  disabled?: boolean;
  onSend: (body: string) => void;
};

export function ChatComposer({ disabled, onSend }: ChatComposerProps) {
  const [body, setBody] = useState("");

  const submit = () => {
    const trimmed = body.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setBody("");
  };

  return (
    <form
      className="flex items-end gap-[var(--space-3)] border-t border-border bg-surface p-[var(--space-4)]"
      onSubmit={(event) => {
        event.preventDefault();
        submit();
      }}
    >
      <Textarea
        value={body}
        onChange={(event) => setBody(event.target.value)}
        placeholder="Write a message..."
        rows={2}
        disabled={disabled}
        className="min-h-[56px] resize-none"
        onKeyDown={(event) => {
          if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault();
            submit();
          }
        }}
      />
      <Button
        type="submit"
        disabled={disabled || !body.trim()}
        className="h-11 min-h-11 shrink-0 px-4"
        aria-label="Send message"
      >
        <Send className="h-4 w-4" aria-hidden />
        Send
      </Button>
    </form>
  );
}
