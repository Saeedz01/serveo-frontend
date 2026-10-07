import Link from "next/link";
import {
  Button,
  ServiceStatusChip,
  Typography,
} from "@/components/ui";
import type { PrototypeService } from "@/lib/prototype-types";

type DashboardVerifiedProps = {
  name: string;
  services: PrototypeService[];
};

export function DashboardVerified({ name, services }: DashboardVerifiedProps) {
  const published = services.filter((service) => service.status === "published").length;
  const drafts = services.filter((service) => service.status === "draft").length;
  const suspended = services.filter((service) => service.status === "suspended").length;

  return (
    <div className="space-y-[var(--space-6)]">
      <div className="relative overflow-hidden rounded-[var(--radius-xl)] border border-border bg-surface p-[var(--space-6)] shadow-[0_20px_50px_-36px_rgba(109,40,217,0.45)]">
        <div
          className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-primary-soft blur-2xl"
          aria-hidden
        />
        <div className="relative flex flex-col gap-[var(--space-4)] lg:flex-row lg:items-end lg:justify-between">
          <div>
            <Typography variant="caption" className="mb-2 block font-semibold tracking-wide text-primary uppercase">
              Verified provider
            </Typography>
            <Typography variant="h1" className="mb-[var(--space-2)]">
              Welcome back, {name}
            </Typography>
            <Typography variant="bodyLarge">
              Your identity is verified. Publish services and grow bookings.
            </Typography>
          </div>
          <Button as="a" href="/provider/services/new" className="rounded-[var(--radius-full)]">
            Create service
          </Button>
        </div>
      </div>

      <div className="grid gap-[var(--space-4)] sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Total services", value: services.length, tone: "bg-primary-soft text-primary" },
          { label: "Published", value: published, tone: "bg-emerald-50 text-success" },
          { label: "Drafts", value: drafts, tone: "bg-amber-50 text-warning" },
          { label: "Suspended", value: suspended, tone: "bg-red-50 text-error" },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-[var(--radius-xl)] border border-border bg-surface p-[var(--space-5)] transition-transform hover:-translate-y-0.5 hover:shadow-[0_16px_36px_-28px_rgba(109,40,217,0.55)]"
          >
            <Typography variant="caption" className="mb-[var(--space-3)] block text-muted">
              {stat.label}
            </Typography>
            <span
              className={`inline-flex min-h-10 min-w-10 items-center justify-center rounded-[var(--radius-lg)] px-3 text-[length:var(--text-2xl)] font-semibold ${stat.tone}`}
            >
              {stat.value}
            </span>
          </div>
        ))}
      </div>

      <div className="overflow-hidden rounded-[var(--radius-xl)] border border-border bg-surface">
        <div className="flex items-center justify-between border-b border-border px-[var(--space-5)] py-[var(--space-4)]">
          <Typography variant="h3">Recent services</Typography>
          <Link
            href="/provider/services"
            className="text-[length:var(--text-sm)] font-medium text-primary hover:underline"
          >
            View all
          </Link>
        </div>
        <ul className="divide-y divide-border">
          {services.slice(0, 5).map((service) => (
            <li
              key={service.id}
              className="flex flex-col gap-[var(--space-2)] px-[var(--space-5)] py-[var(--space-4)] transition-colors hover:bg-secondary/50 sm:flex-row sm:items-center sm:justify-between"
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
          {services.length === 0 ? (
            <li className="px-[var(--space-5)] py-[var(--space-6)]">
              <Typography variant="body" className="text-muted">
                No services yet. Create your first offering to get bookings.
              </Typography>
            </li>
          ) : null}
        </ul>
      </div>
    </div>
  );
}
