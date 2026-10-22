"use client";

import Image from "next/image";
import {
  Button,
  ServiceStatusChip,
  Typography,
  type ViewMode,
} from "@/components/ui";
import { StartChatButton } from "@/components/chat/start-chat-button";
import type { PrototypeService } from "@/lib/prototype-types";
import { cx } from "@/lib/cx";

type AdminServiceCardProps = {
  service: PrototypeService;
  providerLabel: string;
  layout?: ViewMode;
  onSuspend: () => void;
  onRestore: () => void;
  onRemove: () => void;
};

export function AdminServiceCard({
  service,
  providerLabel,
  layout = "grid",
  onSuspend,
  onRestore,
  onRemove,
}: AdminServiceCardProps) {
  const isList = layout === "list";

  const actions = (
    <div className="flex flex-wrap gap-[var(--space-2)]">
      <StartChatButton
        peer={{ role: "provider", id: service.providerId }}
        serviceId={service.id}
        serviceTitle={service.title}
        basePath="/admin/messages"
        label="Message"
        variant="secondary"
        className="h-9 min-h-9 px-3 text-[length:var(--text-sm)]"
      />
      {service.status === "published" ? (
        <Button
          type="button"
          variant="secondary"
          className="h-9 min-h-9 px-3 text-[length:var(--text-sm)]"
          onClick={onSuspend}
        >
          Suspend
        </Button>
      ) : null}
      {service.status === "suspended" ? (
        <Button
          type="button"
          className="h-9 min-h-9 px-3 text-[length:var(--text-sm)]"
          onClick={onRestore}
        >
          Restore
        </Button>
      ) : null}
      <Button
        type="button"
        variant="ghost"
        className="h-9 min-h-9 px-3 text-[length:var(--text-sm)] text-error hover:bg-red-50"
        onClick={onRemove}
      >
        Remove
      </Button>
    </div>
  );

  return (
    <article
      className={cx(
        "overflow-hidden rounded-[var(--radius-xl)] border border-border bg-surface transition-[transform,box-shadow] hover:-translate-y-0.5 hover:shadow-[0_18px_40px_-28px_rgba(10,10,10,0.35)]",
        isList
          ? "flex flex-col gap-[var(--space-4)] p-[var(--space-4)] sm:flex-row sm:items-center"
          : "flex flex-col",
      )}
    >
      <div
        className={cx(
          "relative shrink-0 bg-secondary",
          isList
            ? "aspect-[16/10] w-full overflow-hidden rounded-[var(--radius-lg)] sm:h-28 sm:w-44 sm:aspect-auto"
            : "aspect-[16/10]",
        )}
      >
        <Image
          src={service.imageUrl}
          alt={service.title}
          fill
          sizes={isList ? "176px" : "(max-width: 768px) 100vw, 33vw"}
          className="object-cover"
        />
        {!isList ? (
          <div className="absolute left-3 top-3">
            <ServiceStatusChip status={service.status} />
          </div>
        ) : null}
      </div>

      <div
        className={cx(
          "flex min-w-0 flex-1 flex-col gap-[var(--space-3)]",
          !isList && "p-[var(--space-5)]",
        )}
      >
        <div className="flex flex-wrap items-start gap-[var(--space-2)]">
          <div className="min-w-0 flex-1">
            <Typography variant="h4" className="mb-1 line-clamp-2">
              {service.title}
            </Typography>
            <Typography variant="caption" className="block text-muted">
              {providerLabel} · {service.address}
            </Typography>
          </div>
          {isList ? <ServiceStatusChip status={service.status} /> : null}
        </div>
        <div className={cx(isList ? "" : "mt-auto")}>{actions}</div>
      </div>
    </article>
  );
}
