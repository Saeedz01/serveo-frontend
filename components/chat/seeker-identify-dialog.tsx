"use client";

import { useState } from "react";
import { Button, Input, Label, Typography } from "@/components/ui";
import { usePrototype } from "@/components/prototype/prototype-provider";

type SeekerIdentifyDialogProps = {
  open: boolean;
  title?: string;
  description?: string;
  onCancel: () => void;
  onIdentified: (seekerId: string) => void;
};

export function SeekerIdentifyDialog({
  open,
  title = "Introduce yourself",
  description = "Enter your name and phone so the provider can message you back.",
  onCancel,
  onIdentified,
}: SeekerIdentifyDialogProps) {
  const { identifySeeker } = usePrototype();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState<string | null>(null);

  if (!open) return null;

  const submit = () => {
    if (!name.trim()) {
      setError("Name is required.");
      return;
    }
    if (!phone.trim() || phone.trim().replace(/\D/g, "").length < 7) {
      setError("Enter a valid phone number.");
      return;
    }
    const seeker = identifySeeker({ name, phone });
    setError(null);
    onIdentified(seeker.id);
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-[var(--space-4)]">
      <button
        type="button"
        className="absolute inset-0 bg-foreground/40"
        aria-label="Close dialog"
        onClick={onCancel}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="seeker-identify-title"
        className="relative w-full max-w-md rounded-[var(--radius-xl)] border border-border bg-surface p-[var(--space-6)] shadow-[0_24px_60px_-28px_rgba(10,10,10,0.45)]"
      >
        <Typography
          id="seeker-identify-title"
          variant="h3"
          className="mb-[var(--space-2)]"
        >
          {title}
        </Typography>
        <Typography variant="body" className="mb-[var(--space-5)] text-muted">
          {description}
        </Typography>

        <div className="space-y-[var(--space-4)]">
          <div className="space-y-[var(--space-2)]">
            <Label htmlFor="seeker-name">Name</Label>
            <Input
              id="seeker-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Your name"
              autoComplete="name"
              invalid={Boolean(error && !name.trim())}
            />
          </div>
          <div className="space-y-[var(--space-2)]">
            <Label htmlFor="seeker-phone">Phone</Label>
            <Input
              id="seeker-phone"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              placeholder="Phone number"
              autoComplete="tel"
              invalid={Boolean(error && name.trim())}
            />
          </div>
          {error ? (
            <Typography variant="caption" className="text-error">
              {error}
            </Typography>
          ) : null}
        </div>

        <div className="mt-[var(--space-6)] flex justify-end gap-[var(--space-3)]">
          <Button type="button" variant="secondary" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="button" onClick={submit}>
            Continue
          </Button>
        </div>
      </div>
    </div>
  );
}
