"use client";

import Image from "next/image";
import {
  Button,
  ServiceStatusChip,
  Typography,
} from "@/components/ui";
import type { ViewMode } from "@/components/ui";
import { formatServicePrice, type PrototypeService } from "@/lib/prototype-types";
import { cx } from "@/lib/cx";

type ManagedServiceCardProps = {
  service: PrototypeService;
  categoryLabel: string;
  canPublish: boolean;
  layout?: ViewMode;
  onPublish: () => void;
  onUnpublish: () => void;
  onDelete: () => void;
};

export function ManagedServiceCard({
  service,
  categoryLabel,
  canPublish,
  layout = "grid",
  onPublish,
  onUnpublish,
  onDelete,
}: ManagedServiceCardProps) {
  const isList = layout === "list";

  const actions = (
    <div className="flex flex-wrap gap-[var(--space-2)]">
      <Button
        as="a"
        href={`/provider/services/${service.id}/edit`}
        variant="secondary"
        className="h-9 min-h-9 px-3 text-[length:var(--text-sm)]"
      >
        Edit
      </Button>
      {service.status === "draft" && canPublish ? (
        <Button
          type="button"
          className="h-9 min-h-9 px-3 text-[length:var(--text-sm)]"
          onClick={onPublish}
        >
          Publish
        </Button>
      ) : null}
      {service.status === "published" ? (
        <Button
          type="button"
          variant="secondary"
          className="h-9 min-h-9 px-3 text-[length:var(--text-sm)]"
          onClick={onUnpublish}
        >
          Move to draft
        </Button>
      ) : null}
      <Button
        type="button"
        variant="ghost"
        className="h-9 min-h-9 px-3 text-[length:var(--text-sm)] text-error hover:bg-red-50"
        onClick={onDelete}
      >
        Delete
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
              {categoryLabel} ·{" "}
              {formatServicePrice(service.priceAmount, service.priceUnit)}
            </Typography>
            <Typography variant="caption" className="mt-1 block text-muted">
              {service.address} · {service.radiusKm} km
            </Typography>
          </div>
          {isList ? <ServiceStatusChip status={service.status} /> : null}
        </div>

        {!isList ? (
          <Typography variant="body" className="line-clamp-2 text-muted">
            {service.description}
          </Typography>
        ) : null}

        <div className={cx(isList ? "" : "mt-auto pt-[var(--space-2)]")}>
          {actions}
        </div>

        {service.status === "draft" && !canPublish ? (
          <Typography variant="caption" className="text-warning">
            Awaiting verification to publish
          </Typography>
        ) : null}
        {service.status === "suspended" ? (
          <Typography variant="caption" className="text-error">
            Suspended by admin — not visible to seekers
          </Typography>
        ) : null}
      </div>
    </article>
  );
}
