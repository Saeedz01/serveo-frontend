"use client";

import { useMemo, useState } from "react";
import {
  Button,
  PageHeader,
  ProviderStatusChip,
  Typography,
} from "@/components/ui";
import { usePrototype } from "@/components/prototype/prototype-provider";
import type { PrototypeProvider } from "@/lib/prototype-types";
import { cx } from "@/lib/cx";

export function IdentitiesPanel() {
  const { ready, state, verifyProvider, rejectProvider } = usePrototype();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  const selected = useMemo(
    () => state.providers.find((provider) => provider.id === selectedId) ?? null,
    [selectedId, state.providers],
  );

  if (!ready) {
    return <Typography variant="body">Loading identities...</Typography>;
  }

  return (
    <div className="space-y-[var(--space-6)]">
      <PageHeader
        tone="primary"
        eyebrow="Providers"
        title="Identity verification"
        description="Review ID documents and approve providers before they can publish."
      />

      {feedback ? (
        <div className="rounded-[var(--radius-lg)] border border-success/30 bg-emerald-50 px-[var(--space-4)] py-[var(--space-3)]">
          <Typography variant="body" className="text-success">
            {feedback}
          </Typography>
        </div>
      ) : null}

      <div className="grid gap-[var(--space-5)] xl:grid-cols-[1.1fr_0.9fr]">
        <div className="overflow-hidden rounded-[var(--radius-xl)] border border-border bg-surface">
          <ul className="divide-y divide-border">
            {state.providers.map((provider) => {
              const active = provider.id === selectedId;
              return (
                <li key={provider.id}>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedId(provider.id);
                      setFeedback(null);
                    }}
                    className={cx(
                      "flex w-full flex-col gap-[var(--space-2)] px-[var(--space-5)] py-[var(--space-4)] text-left transition-colors",
                      active ? "bg-primary-soft/70" : "hover:bg-secondary/70",
                    )}
                  >
                    <div className="flex items-center justify-between gap-[var(--space-3)]">
                      <Typography variant="h4">{provider.name}</Typography>
                      <ProviderStatusChip status={provider.status} />
                    </div>
                    <Typography variant="caption" className="text-muted">
                      {provider.phone}
                    </Typography>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>

        <IdentityDetail
          provider={selected}
          onVerify={() => {
            if (!selected) return;
            verifyProvider(selected.id);
            setFeedback(
              `${selected.name} is verified. Their draft services were published automatically.`,
            );
          }}
          onReject={() => {
            if (!selected) return;
            rejectProvider(selected.id);
            setFeedback(`${selected.name} was rejected.`);
          }}
        />
      </div>
    </div>
  );
}

function IdentityDetail({
  provider,
  onVerify,
  onReject,
}: {
  provider: PrototypeProvider | null;
  onVerify: () => void;
  onReject: () => void;
}) {
  if (!provider) {
    return (
      <div className="rounded-[var(--radius-xl)] border border-dashed border-border bg-secondary/40 p-[var(--space-6)]">
        <Typography variant="body" className="text-muted">
          Select a provider application to review ID images and take action.
        </Typography>
      </div>
    );
  }

  return (
    <div className="space-y-[var(--space-4)] rounded-[var(--radius-xl)] border border-border bg-surface p-[var(--space-5)] shadow-[0_16px_36px_-30px_rgba(10,10,10,0.35)]">
      <div className="flex items-start justify-between gap-[var(--space-3)]">
        <div>
          <Typography variant="h3" className="mb-1">
            {provider.name}
          </Typography>
          <Typography variant="caption" className="text-muted">
            {provider.phone}
          </Typography>
        </div>
        <ProviderStatusChip status={provider.status} />
      </div>

      <div className="grid gap-[var(--space-3)] sm:grid-cols-2">
        <IdPreview label="ID front" src={provider.idFrontUrl} />
        <IdPreview label="ID back" src={provider.idBackUrl} />
      </div>

      <div className="flex flex-wrap gap-[var(--space-3)]">
        <Button type="button" onClick={onVerify} disabled={provider.status === "verified"}>
          Verify identity
        </Button>
        <Button
          type="button"
          variant="secondary"
          onClick={onReject}
          disabled={provider.status === "rejected"}
          className="border-error text-error hover:bg-red-50"
        >
          Reject
        </Button>
      </div>
    </div>
  );
}

function IdPreview({ label, src }: { label: string; src: string }) {
  return (
    <div>
      <Typography variant="caption" className="mb-2 block text-muted">
        {label}
      </Typography>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={label}
        className="h-40 w-full rounded-[var(--radius-lg)] border border-border object-cover"
      />
    </div>
  );
}
