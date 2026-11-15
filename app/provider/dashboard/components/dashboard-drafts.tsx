import Link from "next/link";
import { ServiceStatusChip, Typography } from "@/components/ui";
import type { ServiceDto } from "@/service/api";

export function DashboardDrafts({ services }: { services: ServiceDto[] }) {
  const drafts = services.filter((service) => service.status === "draft");
  if (drafts.length === 0) return null;

  return (
    <div className="overflow-hidden rounded-[var(--radius-xl)] border border-border bg-surface">
      <div className="flex items-center justify-between border-b border-border px-[var(--space-5)] py-[var(--space-4)]">
        <Typography variant="h3">Your drafts</Typography>
        <Link
          href="/provider/services"
          className="text-[length:var(--text-sm)] font-medium text-primary hover:underline"
        >
          Manage
        </Link>
      </div>
      <ul className="divide-y divide-border">
        {drafts.slice(0, 5).map((service) => (
          <li
            key={service.id}
            className="flex flex-col gap-[var(--space-2)] px-[var(--space-5)] py-[var(--space-4)] sm:flex-row sm:items-center sm:justify-between"
          >
            <div>
              <Typography variant="label" className="block">
                {service.title}
              </Typography>
              <Typography variant="caption" className="text-muted">
                {service.address}
              </Typography>
            </div>
            <ServiceStatusChip status={service.status} />
          </li>
        ))}
      </ul>
    </div>
  );
}
