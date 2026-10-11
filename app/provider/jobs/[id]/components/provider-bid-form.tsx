"use client";

import { useState } from "react";
import {
  Button,
  Input,
  Label,
  Textarea,
  Typography,
} from "@/components/ui";
import { usePrototype } from "@/components/prototype/prototype-provider";

type ProviderBidFormProps = {
  jobId: string;
  providerId: string;
  providerName: string;
};

export function ProviderBidForm({
  jobId,
  providerId,
  providerName,
}: ProviderBidFormProps) {
  const { createJobBid } = usePrototype();
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    const parsed = Number(amount);
    if (!Number.isFinite(parsed) || parsed <= 0) {
      setError("Enter a valid bid amount.");
      return;
    }

    setBusy(true);
    const result = createJobBid({
      jobId,
      providerId,
      providerName,
      amount: parsed,
      note,
    });
    setBusy(false);

    if (!result.ok) {
      setError(result.reason);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-[var(--space-4)] rounded-[var(--radius-xl)] border border-border bg-surface p-[var(--space-5)]"
      noValidate
    >
      <div>
        <Typography variant="h3" className="mb-[var(--space-2)]">
          Place a bid
        </Typography>
        <Typography variant="body" className="text-muted">
          One bid per job. The seeker chooses which provider to hire.
        </Typography>
      </div>

      <div>
        <Label htmlFor="bid-amount">Your price (USD)</Label>
        <Input
          id="bid-amount"
          type="number"
          min="1"
          step="1"
          inputMode="decimal"
          value={amount}
          onChange={(event) => setAmount(event.target.value)}
          placeholder="150"
        />
      </div>

      <div>
        <Label htmlFor="bid-note">Note (optional)</Label>
        <Textarea
          id="bid-note"
          value={note}
          onChange={(event) => setNote(event.target.value)}
          placeholder="Timing, what’s included, or questions."
        />
      </div>

      {error ? (
        <Typography variant="caption" className="block text-error">
          {error}
        </Typography>
      ) : null}

      <Button type="submit" disabled={busy}>
        {busy ? "Submitting..." : "Submit bid"}
      </Button>
    </form>
  );
}