import { Star } from "lucide-react";
import { Typography } from "@/components/ui";
import type { Provider } from "./marketplace-data";

type ProviderCardProps = {
  provider: Provider;
  featured?: boolean;
};

export function ProviderCard({ provider, featured = false }: ProviderCardProps) {
  return (
    <article
      className={
        featured
          ? "w-full max-w-sm rounded-[var(--radius-xl)] border border-border bg-surface p-[var(--space-5)] shadow-[0_20px_50px_-28px_rgba(92,61,145,0.45)]"
          : "w-56 rounded-[var(--radius-lg)] border border-border bg-surface/95 p-[var(--space-4)] shadow-[0_12px_30px_-18px_rgba(10,10,10,0.35)] backdrop-blur"
      }
    >
      <div className="mb-[var(--space-4)] flex items-center gap-[var(--space-3)]">
        <div
          className={
            featured
              ? "flex h-14 w-14 items-center justify-center rounded-[var(--radius-full)] bg-primary text-[length:var(--text-lg)] font-semibold text-primary-foreground"
              : "flex h-11 w-11 items-center justify-center rounded-[var(--radius-full)] bg-secondary text-[length:var(--text-sm)] font-semibold text-primary"
          }
          aria-hidden
        >
          {provider.initials}
        </div>
        <div className="min-w-0">
          <Typography variant="h4" className="truncate">
            {provider.name}
          </Typography>
          <Typography variant="caption" className="mt-1 block">
            {provider.role}
          </Typography>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-x-[var(--space-4)] gap-y-[var(--space-2)]">
        <Typography variant="label" className="inline-flex items-center gap-1">
          <Star className="h-4 w-4 fill-primary text-primary" aria-hidden />
          {provider.rating.toFixed(2)}
        </Typography>
        <Typography variant="caption">{provider.jobs} jobs</Typography>
        <Typography variant="label">{provider.rate}</Typography>
      </div>

      <Typography
        variant="caption"
        className="mt-[var(--space-4)] inline-flex rounded-[var(--radius-full)] bg-primary-soft px-[var(--space-3)] py-[var(--space-1)] font-medium text-primary"
      >
        {provider.status}
      </Typography>
    </article>
  );
}
