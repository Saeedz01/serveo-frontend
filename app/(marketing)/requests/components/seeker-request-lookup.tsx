"use client";

import { useState } from "react";
import { Button, Input, Label, Typography } from "@/components/ui";
import { usePrototype } from "@/components/prototype/prototype-provider";

type SeekerRequestLookupProps = {
  onFound: () => void;
};

function isValidPhone(value: string) {
  return /^[+()\d\s-]{8,}$/.test(value.trim());
}

export function SeekerRequestLookup({ onFound }: SeekerRequestLookupProps) {
  const { identifySeeker } = usePrototype();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!name.trim()) {
      setError("Enter the name you used on your request.");
      return;
    }
    if (!isValidPhone(phone)) {
      setError("Enter a valid phone number.");
      return;
    }

    identifySeeker({ name, phone });
    setError(null);
    onFound();
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="mx-auto max-w-md space-y-[var(--space-4)] rounded-[var(--radius-xl)] border border-border bg-surface p-[var(--space-6)]"
      noValidate
    >
      <div>
        <Typography variant="h3" className="mb-[var(--space-2)]">
          Track your requests
        </Typography>
        <Typography variant="body" className="text-muted">
          Enter the name and phone you used when requesting a service.
        </Typography>
      </div>

      <div>
        <Label htmlFor="track-name">Your name</Label>
        <Input
          id="track-name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Jordan Lee"
          autoComplete="name"
        />
      </div>

      <div>
        <Label htmlFor="track-phone">Phone number</Label>
        <Input
          id="track-phone"
          type="tel"
          inputMode="tel"
          value={phone}
          onChange={(event) => setPhone(event.target.value)}
          placeholder="+1 (555) 000-0000"
          autoComplete="tel"
        />
      </div>

      {error ? (
        <Typography variant="caption" className="block text-error">
          {error}
        </Typography>
      ) : null}

      <Button type="submit" className="w-full">
        View my requests
      </Button>
    </form>
  );
}
