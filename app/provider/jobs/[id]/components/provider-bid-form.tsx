"use client";

import { useState } from "react";
import {
  Button,
  Input,
  Label,
  Textarea,
  Typography,
  useToast,
} from "@/components/ui";
import { useCreateBiddingMutation } from "@/service/api";
import { getApiErrorMessage } from "@/service/auth-session";

type ProviderBidFormProps = {
  jobId: string;
};

export function ProviderBidForm({ jobId }: ProviderBidFormProps) {
  const { pushToast } = useToast();
  const [createBidding, { isLoading: busy }] = useCreateBiddingMutation();
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    const parsed = Number(amount);
    if (!Number.isFinite(parsed) || parsed <= 0) {
      setError("Enter a valid bid amount.");
      return;
    }

    try {
      await createBidding({
        jobId,
        price: parsed,
        note: note.trim() || undefined,
      }).unwrap();
      pushToast({
        tone: "success",
        title: "Bid submitted",
        description: "The seeker can review your offer on this job.",
      });
    } catch (err) {
      const message = getApiErrorMessage(err, "Could not place this bid.");
      setError(message);
      pushToast({
        tone: "error",
        title: "Bid failed",
        description: message,
      });
    }
  };

  return (
    <form
      onSubmit={(event) => {
        void handleSubmit(event);
      }}
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
