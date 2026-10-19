"use client";

import { MessageSquare } from "lucide-react";
import { Button, EmptyState, Typography } from "@/components/ui";

export function SeekerChatPlaceholder() {
  return (
    <div className="space-y-[var(--space-4)]">
      <div className="rounded-[var(--radius-xl)] border border-dashed border-border bg-surface/60 px-[var(--space-5)] py-[var(--space-4)]">
        <Typography variant="body" className="text-muted">
          Chat with providers about bookings and job bids will live here. Messaging
          is not connected yet — you can still track requests and job posts above.
        </Typography>
      </div>
      <EmptyState
        title="No conversations yet"
        description="When a provider messages you about a request or job, threads will show up in this inbox."
        action={
          <Button as="a" href="/services" variant="secondary">
            <MessageSquare className="h-4 w-4" aria-hidden />
            Browse services
          </Button>
        }
      />
    </div>
  );
}
