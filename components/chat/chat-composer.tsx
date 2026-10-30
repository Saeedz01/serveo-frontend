"use client";

import { useRef, useState } from "react";
import { Paperclip, Send, X } from "lucide-react";
import { Button, Textarea, Typography } from "@/components/ui";
import type { PendingAttachment } from "@/lib/chat/chat-transport";

type ChatComposerProps = {
  disabled?: boolean;
  onSend: (body: string, attachments: PendingAttachment[]) => void;
  onTyping?: (isTyping: boolean) => void;
};

const MAX_FILES = 3;
const MAX_BYTES = 5_000_000;

async function fileToAttachment(file: File): Promise<PendingAttachment> {
  const url = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("Failed to read file."));
    reader.readAsDataURL(file);
  });
  return {
    name: file.name,
    mimeType: file.type || "application/octet-stream",
    sizeBytes: file.size,
    url,
  };
}

export function ChatComposer({ disabled, onSend, onTyping }: ChatComposerProps) {
  const [body, setBody] = useState("");
  const [attachments, setAttachments] = useState<PendingAttachment[]>([]);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const typingIdleRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const bumpTyping = () => {
    onTyping?.(true);
    if (typingIdleRef.current) clearTimeout(typingIdleRef.current);
    typingIdleRef.current = setTimeout(() => onTyping?.(false), 1500);
  };

  const submit = () => {
    const trimmed = body.trim();
    if ((!trimmed && attachments.length === 0) || disabled) return;
    onSend(trimmed, attachments);
    setBody("");
    setAttachments([]);
    setError(null);
    onTyping?.(false);
  };

  const addFiles = async (files: FileList | null) => {
    if (!files?.length) return;
    setError(null);
    const next = [...attachments];
    for (const file of Array.from(files)) {
      if (next.length >= MAX_FILES) {
        setError(`Up to ${MAX_FILES} attachments.`);
        break;
      }
      const okType =
        file.type.startsWith("image/") || file.type === "application/pdf";
      if (!okType) {
        setError("Only images and PDFs are allowed.");
        continue;
      }
      if (file.size > MAX_BYTES) {
        setError("Each file must be under 5MB.");
        continue;
      }
      next.push(await fileToAttachment(file));
    }
    setAttachments(next);
    if (fileRef.current) fileRef.current.value = "";
  };

  return (
    <form
      className="flex shrink-0 flex-col gap-[var(--space-2)] border-t border-border bg-surface p-[var(--space-4)]"
      onSubmit={(event) => {
        event.preventDefault();
        submit();
      }}
    >
      {attachments.length > 0 ? (
        <ul className="flex flex-wrap gap-2">
          {attachments.map((file, index) => (
            <li
              key={`${file.name}-${index}`}
              className="inline-flex max-w-full items-center gap-2 rounded-[var(--radius-md)] border border-border bg-secondary px-2 py-1"
            >
              <Typography variant="caption" className="truncate">
                {file.name}
              </Typography>
              <button
                type="button"
                className="text-muted hover:text-foreground"
                aria-label={`Remove ${file.name}`}
                onClick={() =>
                  setAttachments((prev) => prev.filter((_, i) => i !== index))
                }
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </li>
          ))}
        </ul>
      ) : null}
      {error ? (
        <Typography variant="caption" className="text-error">
          {error}
        </Typography>
      ) : null}
      <div className="flex items-end gap-[var(--space-2)] sm:gap-[var(--space-3)]">
        <input
          ref={fileRef}
          type="file"
          accept="image/*,application/pdf"
          multiple
          className="hidden"
          onChange={(event) => {
            void addFiles(event.target.files);
          }}
        />
        <Button
          type="button"
          variant="secondary"
          className="h-11 min-h-11 shrink-0 px-3"
          disabled={disabled}
          aria-label="Attach file"
          onClick={() => fileRef.current?.click()}
        >
          <Paperclip className="h-4 w-4" aria-hidden />
        </Button>
        <Textarea
          value={body}
          onChange={(event) => {
            setBody(event.target.value);
            bumpTyping();
          }}
          placeholder="Write a message..."
          rows={2}
          disabled={disabled}
          className="min-h-[56px] min-w-0 flex-1 resize-none"
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.shiftKey) {
              event.preventDefault();
              submit();
            }
          }}
        />
        <Button
          type="submit"
          disabled={disabled || (!body.trim() && attachments.length === 0)}
          className="h-11 min-h-11 shrink-0 px-3 sm:px-4"
          aria-label="Send message"
        >
          <Send className="h-4 w-4" aria-hidden />
          <span className="hidden sm:inline">Send</span>
        </Button>
      </div>
    </form>
  );
}
