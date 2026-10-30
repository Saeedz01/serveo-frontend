"use client";

import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Typography } from "@/components/ui/typography";

type ConfirmDialogProps = {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: "danger" | "primary";
  busy?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  children?: ReactNode;
};

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  tone = "primary",
  busy = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-[var(--space-4)]">
      <button
        type="button"
        className="absolute inset-0 bg-foreground/40"
        aria-label="Close dialog"
        onClick={onCancel}
      />
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
        aria-describedby="confirm-description"
        className="relative w-full max-w-md rounded-[var(--radius-xl)] border border-border bg-surface p-[var(--space-6)] shadow-[0_24px_60px_-28px_rgba(10,10,10,0.45)]"
      >
        <Typography id="confirm-title" variant="h3" className="mb-[var(--space-2)]">
          {title}
        </Typography>
        <Typography
          id="confirm-description"
          variant="body"
          className="mb-[var(--space-6)] text-muted"
        >
          {description}
        </Typography>
        <div className="flex flex-col-reverse gap-[var(--space-3)] sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="secondary"
            className="w-full sm:w-auto"
            onClick={onCancel}
            disabled={busy}
          >
            {cancelLabel}
          </Button>
          <Button
            type="button"
            onClick={onConfirm}
            disabled={busy}
            className={
              tone === "danger"
                ? "w-full bg-error hover:bg-[#991b1b] sm:w-auto"
                : "w-full sm:w-auto"
            }
          >
            {busy ? "Working..." : confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
